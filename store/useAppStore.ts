import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOpencodeClient, setBaseUrl, getModelDetails } from '@/services';
import type { Part, Agent } from '@opencode-ai/sdk';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    parts?: Part[];
    timestamp: number;
}

export interface Session {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: number;
    messagesFetched?: boolean;
}

export interface Model {
    id: string;
    provider: string;
    name: string;
}

export interface ModelDetails {
    cost?: {
        input: number;
        output: number;
        cache_read?: number;
        cache_write?: number;
    };
    limit?: {
        context: number;
        output: number;
    };
}

export interface SessionTokens {
    tokens: {
        input: number;
        output: number;
        reasoning: number;
        cache: {
            read: number;
            write: number;
        };
    };
    cost: number;
}

export interface Provider {
    id: string;
    name: string;
    models: Model[];
}

interface AppStore {
    baseURL: string;
    loadBaseURL: () => Promise<void>;
    setBaseURL: (url: string) => Promise<void>;
    isBaseURLValid: (url: string) => boolean;

    agents: Agent[];
    currentAgentIndex: number;
    fetchAgents: () => Promise<void>;
    cycleAgent: () => void;
    getCurrentAgent: () => Agent | null;

    models: Model[];
    currentModel: string | null;
    currentModelDetails: ModelDetails | null;
    recentModels: string[];
    fetchModels: () => Promise<void>;
    setCurrentModel: (modelId: string) => Promise<void>;
    getCurrentModel: () => string | null;
    getCurrentModelDetails: () => ModelDetails | null;

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

    sessionTokens: Record<string, SessionTokens>;
    getSessionTokens: () => SessionTokens | null;
    updateSessionTokens: (sessionId: string, tokens: SessionTokens) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
    baseURL: '',
    loadBaseURL: async () => {
        try {
            const savedURL = await AsyncStorage.getItem('baseURL');
            if (savedURL) {
                set({ baseURL: savedURL });
                setBaseUrl(savedURL);
                await get().syncSessionsFromSDK();
                await get().fetchAgents();
                await get().fetchModels();
            }
        } catch (error) {
            console.error('Failed to load baseURL:', error);
        }
    },
    setBaseURL: async (url: string) => {
        set({ baseURL: url });
        setBaseUrl(url);

        // Persist to storage
        try {
            await AsyncStorage.setItem('baseURL', url);
        } catch (error) {
            console.error('Failed to save baseURL:', error);
        }

        await get().syncSessionsFromSDK();
        await get().fetchAgents();
        await get().fetchModels();
    },
    isBaseURLValid: (url: string) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    agents: [],
    currentAgentIndex: 0,
    fetchAgents: async () => {
        try {
            const client = getOpencodeClient();
            const result = await client.app.agents();

            if (result.data) {
                // Filter only primary agents
                const filtered = result.data.filter((a: Agent) => a.mode === 'primary');
                console.log('Fetched agents:', filtered.length, filtered.map(a => a.name));

                // Clear old index and start fresh
                await AsyncStorage.removeItem('currentAgentIndex');

                const validIndex = filtered.length > 0 ? 0 : 0;

                set({ agents: filtered, currentAgentIndex: validIndex });

                // Save valid index
                await AsyncStorage.setItem('currentAgentIndex', String(validIndex));
                console.log('Set agents in store:', { count: filtered.length, currentIndex: validIndex });
            }
        } catch (error) {
            console.error('Failed to fetch agents:', error);
        }
    },
    cycleAgent: async () => {
        const { agents, currentAgentIndex } = get();
        if (agents.length === 0) return;

        const nextIndex = (currentAgentIndex + 1) % agents.length;
        set({ currentAgentIndex: nextIndex });

        // Persist to storage
        try {
            await AsyncStorage.setItem('currentAgentIndex', String(nextIndex));
        } catch (error) {
            console.error('Failed to save agent index:', error);
        }
    },
    getCurrentAgent: () => {
        const { agents, currentAgentIndex } = get();
        return agents[currentAgentIndex] || null;
    },

    models: [],
    currentModel: null,
    currentModelDetails: null,
    recentModels: [],
    fetchModels: async () => {
        try {
            const client = getOpencodeClient();
            const result = await client.config.providers();

            if (result.data) {
                const allModels: Model[] = [];
                result.data.providers.forEach((provider: any) => {
                    if (provider.models && typeof provider.models === 'object') {
                        // models is an object with model IDs as keys
                        Object.entries(provider.models).forEach(([modelId, modelData]: [string, any]) => {
                            allModels.push({
                                id: `${provider.id}/${modelId}`,
                                provider: provider.id,
                                name: modelData.name || modelId,
                            });
                        });
                    }
                });

                set({ models: allModels });

                // Priority: 1. saved model, 2. SDK config model, 3. grok-code-fast fallback
                const savedModel = await AsyncStorage.getItem('currentModel');
                if (savedModel && allModels.find(m => m.id === savedModel)) {
                    set({ currentModel: savedModel });
                    const details = await getModelDetails(savedModel);
                    set({ currentModelDetails: details });
                } else {
                    // Try to get current model from SDK config
                    try {
                        const configResult = await client.config.get();
                        const sdkModel = configResult.data?.model;
                        if (sdkModel && allModels.find(m => m.id === sdkModel)) {
                            set({ currentModel: sdkModel });
                            await AsyncStorage.setItem('currentModel', sdkModel);
                            const details = await getModelDetails(sdkModel);
                            set({ currentModelDetails: details });
                        } else {
                            // Fallback to grok-code-fast
                            const fallback = 'opencode/grok-code-fast';
                            const model = allModels.find(m => m.id === fallback) || allModels[0];
                            if (model) {
                                set({ currentModel: model.id });
                                await AsyncStorage.setItem('currentModel', model.id);
                                const details = await getModelDetails(model.id);
                                set({ currentModelDetails: details });
                            }
                        }
                    } catch (e) {
                        console.error('Failed to get SDK config model:', e);
                        // Fallback to grok-code-fast
                        const fallback = 'opencode/grok-code-fast';
                        const model = allModels.find(m => m.id === fallback) || allModels[0];
                        if (model) {
                            set({ currentModel: model.id });
                            await AsyncStorage.setItem('currentModel', model.id);
                            const details = await getModelDetails(model.id);
                            set({ currentModelDetails: details });
                        }
                    }
                }

                // Load recent models
                const savedRecents = await AsyncStorage.getItem('recentModels');
                if (savedRecents) {
                    try {
                        const recents = JSON.parse(savedRecents);
                        set({ recentModels: recents });
                    } catch (e) {
                        console.error('Failed to parse recent models:', e);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch models:', error);
        }
    },
    setCurrentModel: async (modelId: string) => {
        set({ currentModel: modelId });
        
        // Update recent models (max 5, most recent first)
        const { recentModels } = get();
        const updated = [modelId, ...recentModels.filter(m => m !== modelId)].slice(0, 5);
        set({ recentModels: updated });

        try {
            await AsyncStorage.setItem('currentModel', modelId);
            await AsyncStorage.setItem('recentModels', JSON.stringify(updated));
        } catch (error) {
            console.error('Failed to save model:', error);
        }

        // Fetch and cache model details
        const details = await getModelDetails(modelId);
        set({ currentModelDetails: details });
    },
    getCurrentModel: () => {
        return get().currentModel;
    },
    getCurrentModelDetails: () => {
        return get().currentModelDetails;
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

                    // Extract text content for display
                    const textParts = parts.filter((p: any) => p.type === 'text');
                    const content = textParts.length > 0
                        ? textParts.map((p: any) => p.text).join('\n')
                        : '';

                    return {
                        id: info.id,
                        role: info.role as 'user' | 'assistant',
                        content,
                        parts, // Preserve all parts for rendering
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

                // Parse tokens from all assistant messages
                let totalInput = 0;
                let totalOutput = 0;
                let totalReasoning = 0;
                let totalCacheRead = 0;
                let totalCacheWrite = 0;
                let totalCost = 0;

                messages.forEach((message) => {
                    if (message.role === 'assistant' && message.parts) {
                        const stepFinishParts = message.parts.filter((p: any) => p.type === 'step-finish');
                        
                        stepFinishParts.forEach((part: any) => {
                            if (part.tokens) {
                                totalInput += part.tokens.input || 0;
                                totalOutput += part.tokens.output || 0;
                                totalReasoning += part.tokens.reasoning || 0;
                                totalCacheRead += part.tokens.cache?.read || 0;
                                totalCacheWrite += part.tokens.cache?.write || 0;
                            }
                            if (part.cost) {
                                totalCost += part.cost;
                            }
                        });
                    }
                });

                // Update session tokens
                if (totalInput > 0 || totalOutput > 0 || totalReasoning > 0) {
                    const sessionTokens: SessionTokens = {
                        tokens: {
                            input: totalInput,
                            output: totalOutput,
                            reasoning: totalReasoning,
                            cache: {
                                read: totalCacheRead,
                                write: totalCacheWrite,
                            },
                        },
                        cost: totalCost,
                    };
                    get().updateSessionTokens(sessionId, sessionTokens);
                }
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

        // Parse step-finish parts for token tracking (only for assistant messages)
        if (message.role === 'assistant' && message.parts) {
            const stepFinishParts = message.parts.filter((p: any) => p.type === 'step-finish');
            
            if (stepFinishParts.length > 0) {
                let totalInput = 0;
                let totalOutput = 0;
                let totalReasoning = 0;
                let totalCacheRead = 0;
                let totalCacheWrite = 0;
                let totalCost = 0;

                stepFinishParts.forEach((part: any) => {
                    if (part.tokens) {
                        totalInput += part.tokens.input || 0;
                        totalOutput += part.tokens.output || 0;
                        totalReasoning += part.tokens.reasoning || 0;
                        totalCacheRead += part.tokens.cache?.read || 0;
                        totalCacheWrite += part.tokens.cache?.write || 0;
                    }
                    if (part.cost) {
                        totalCost += part.cost;
                    }
                });

                // Get existing session tokens
                const existing = get().sessionTokens[sessionId];
                const updated: SessionTokens = {
                    tokens: {
                        input: (existing?.tokens.input || 0) + totalInput,
                        output: (existing?.tokens.output || 0) + totalOutput,
                        reasoning: (existing?.tokens.reasoning || 0) + totalReasoning,
                        cache: {
                            read: (existing?.tokens.cache.read || 0) + totalCacheRead,
                            write: (existing?.tokens.cache.write || 0) + totalCacheWrite,
                        },
                    },
                    cost: (existing?.cost || 0) + totalCost,
                };

                get().updateSessionTokens(sessionId, updated);
            }
        }
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

    sessionTokens: {},
    getSessionTokens: () => {
        const sessionId = get().currentSessionId;
        if (!sessionId) return null;
        return get().sessionTokens[sessionId] || null;
    },
    updateSessionTokens: (sessionId: string, tokens: SessionTokens) => {
        set((state) => ({
            sessionTokens: {
                ...state.sessionTokens,
                [sessionId]: tokens,
            },
        }));
    },
}));
