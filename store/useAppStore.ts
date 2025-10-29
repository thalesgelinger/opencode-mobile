import { create } from 'zustand';

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
  setBaseURL: (url: string) => void;
  isBaseURLValid: (url: string) => boolean;
  
  sessions: Session[];
  currentSessionId: string | null;
  setCurrentSessionId: (id: string) => void;
  createSession: (title: string) => string;
  deleteSession: (id: string) => void;
  
  addMessage: (sessionId: string, message: ChatMessage) => void;
  getCurrentSession: () => Session | null;
  clearCurrentSession: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  baseURL: '',
  setBaseURL: (url: string) => set({ baseURL: url }),
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
