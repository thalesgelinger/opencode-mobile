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
}

interface AppStore {
  baseURL: string;
  setBaseURL: (url: string) => Promise<void>;
  isBaseURLValid: (url: string) => boolean;
  
  sessions: Session[];
  currentSessionId: string | null;
  setCurrentSessionId: (id: string) => void;
  syncSessionsFromSDK: () => Promise<void>;
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
      })) || [];
      
      set({ sessions });
      
      // Set first session as current if none selected
      if (!get().currentSessionId && sessions.length > 0) {
        set({ currentSessionId: sessions[0].id });
      }
    } catch (error) {
      console.error('Failed to sync sessions:', error);
    }
  },
  
  createSession: (title: string) => {
    const id = Date.now().toString();
    const newSession: Session = {
      id,
      title,
      messages: [],
      createdAt: Date.now(),
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
