import { create } from 'zustand';
import { getOpencodeClient, setBaseUrl } from '@/services';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Session {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  messagesFetched?: boolean; // Track if messages loaded from server
}

interface AppStore {
  baseURL: string;
  setBaseURL: (url: string) => Promise<void>;
  isBaseURLValid: (url: string) => boolean;
  
  sessions: Session[];
  currentSessionId: string | null;
  isLoadingMessages: boolean;
  setCurrentSessionId: (id: string) => void;
  syncSessionsFromSDK: () => Promise<void>;
  fetchSessionMessages: (sessionId: string) => Promise<void>;
  createSession: (title: string) => string;
  deleteSession: (id: string) => void;
  
  addMessage: (sessionId: string, message: ChatMessage) => void;
  getCurrentSession: () => Session | null;
  clearCurrentSession: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  baseURL: '',
  setBaseURL: async (url: string) => {
    set({ baseURL: url });
    setBaseUrl(url);
    await get().syncSessionsFromSDK();
  },
  isBaseURLValid: (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  sessions: [],
  currentSessionId: null,
  isLoadingMessages: false,
  setCurrentSessionId: (id: string) => set({ currentSessionId: id }),
  
  syncSessionsFromSDK: async () => {
    try {
      const client = getOpencodeClient();
      const sdkSessions = await client.session.list();
      
      const sessions: Session[] = sdkSessions.data?.map((s: any) => ({
        id: s.id,
        title: s.title || 'Untitled',
        messages: [],
        createdAt: new Date(s.createdAt).getTime(),
        messagesFetched: false,
      })) || [];
      
      set({ sessions });
      
      // Set first session as current if none selected
      if (!get().currentSessionId && sessions.length > 0) {
        set({ currentSessionId: sessions[0].id });
      }
    } catch (error) {
      console.error('Failed to sync sessions:', error);
      throw error;
    }
  },

  fetchSessionMessages: async (sessionId: string) => {
    const session = get().sessions.find(s => s.id === sessionId);
    
    // Skip if already fetched (caching)
    if (session?.messagesFetched) {
      return;
    }

    set({ isLoadingMessages: true });

    try {
      const client = getOpencodeClient();
      const result = await client.session.messages({ path: { id: sessionId } });

      if (result.data) {
        const messages: ChatMessage[] = result.data.map((msg: any) => {
          const { info, parts } = msg;
          
          // Extract text content
          const textParts = parts.filter((p: any) => p.type === 'text');
          
          if (textParts.length > 0) {
            return {
              id: info.id,
              role: info.role as 'user' | 'assistant',
              content: textParts.map((p: any) => p.text).join('\n'),
              timestamp: new Date(info.createdAt).getTime(),
            };
          }
          
          // Fallback for non-text parts
          const partTypes = parts.map((p: any) => p.type).join(', ');
          return {
            id: info.id,
            role: info.role as 'user' | 'assistant',
            content: `[Unsupported message type: ${partTypes}. Implementation needed.]`,
            timestamp: new Date(info.createdAt).getTime(),
          };
        });

        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, messages, messagesFetched: true }
              : s
          ),
        }));
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      throw error;
    } finally {
      set({ isLoadingMessages: false });
    }
  },
  
  createSession: (title: string) => {
    const id = Date.now().toString();
    const newSession: Session = {
      id,
      title,
      messages: [],
      createdAt: Date.now(),
      messagesFetched: true, // New sessions have no messages
    };
    set((state) => ({
      sessions: [newSession, ...state.sessions],
      currentSessionId: id,
    }));
    return id;
  },

  deleteSession: (id: string) => {
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      currentSessionId:
        state.currentSessionId === id ? null : state.currentSessionId,
    }));
  },

  addMessage: (sessionId: string, message: ChatMessage) => {
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId
          ? { ...session, messages: [...session.messages, message] }
          : session
      ),
    }));
  },

  getCurrentSession: () => {
    const { sessions, currentSessionId } = get();
    if (!currentSessionId) return null;
    return sessions.find((s) => s.id === currentSessionId) || null;
  },

  clearCurrentSession: () => {
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === state.currentSessionId
          ? { ...session, messages: [] }
          : session
      ),
    }));
  },
}));
