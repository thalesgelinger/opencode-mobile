import { createOpencodeClient } from "@opencode-ai/sdk/client"
import type { Event, FileDiff } from "@opencode-ai/sdk"
import EventSource from 'react-native-sse';


let opencodeClient = createOpencodeClient({
    baseUrl: ""
})

export const getOpencodeClient = () => opencodeClient

export const setBaseUrl = async (url: string) => {
    opencodeClient = createOpencodeClient({
        baseUrl: url
    })
}

// Helper: Fetch file diff for a patch
// TODO: Implement once SDK session client methods are available
export const fetchPatchDiff = async (sessionId: string, hash: string): Promise<FileDiff[]> => {
    console.log('fetchPatchDiff stub:', { sessionId, hash })
    // Stubbed for now - will implement with proper SDK session.diff() call
    return []
}

// Helper: Read file content from URL
export const readFileFromURL = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`)
        }
        return await response.text()
    } catch (error) {
        console.error('readFileFromURL error:', error)
        throw error
    }
}

// Helper: Get model cost/limit details from provider data
export const getModelDetails = async (modelId: string) => {
    try {
        const client = getOpencodeClient()
        const result = await client.config.providers()

        if (!result.data) return null

        const [providerId, modelKey] = modelId.split('/')
        const provider = result.data.providers.find((p: any) => p.id === providerId)

        if (!provider?.models?.[modelKey]) return null

        const modelData = provider.models[modelKey]

        return {
            cost: modelData.cost || undefined,
            limit: modelData.limit || undefined,
        }
    } catch (error) {
        console.error('getModelDetails error:', error)
        return null
    }
}

// SSE Event Listener
let isEventListenerRunning = false

function createSSEStream(baseURL: string): { stream: AsyncGenerator<Event> } {
    const es = new EventSource(`${baseURL}/event`);

    // Queue to buffer incoming messages
    const queue: Array<any> = [];
    let resolveNext: ((data: { value: any, done: boolean }) => void) | null = null;
    let isClosed = false;

    // When a new message arrives, push it to the queue or resolve a pending await
    es.addEventListener('message', (event) => {
        if (resolveNext) {
            resolveNext({ value: JSON.parse(event.data), done: false });
            resolveNext = null;
        } else {
            queue.push(event.data);
        }
    });

    es.addEventListener('error', (err) => {
        console.error('[SSE error]', err);
        close();
    });

    // Clean close
    function close() {
        if (!isClosed) {
            es.close();
            isClosed = true;
            if (resolveNext) {
                resolveNext({ value: undefined, done: true });
            }
        }
    }

    // Async iterator
    const stream = {
        [Symbol.asyncIterator]() {
            return this;
        },
        async next() {
            if (queue.length > 0) {
                return { value: queue.shift(), done: false };
            }
            if (isClosed) {
                return { value: undefined, done: true };
            }
            return new Promise((resolve) => {
                resolveNext = resolve;
            });
        },
        return() {
            close();
            return { done: true };
        },
    };

    return { stream, close };
}

const handleSSEEvent = (event: Event) => {
    switch (event.type) {
        case "installation.updated":
            break
        case "lsp.client.diagnostics":
            break
        case "message.updated":
            break
        case "message.removed":
            break
        case "message.part.updated":
            break
        case "message.part.removed":
            break
        case "session.compacted":
            break
        case "permission.updated":
            break
        case "permission.replied":
            break
        case "file.edited":
            break
        case "file.watcher.updated":
            break
        case "todo.updated":
            break
        case "session.idle":
            break
        case "session.created":
            break
        case "session.updated":
            break
        case "session.deleted":
            break
        case "session.error":
            break
        case "server.connected":
            break
        case "ide.installed":
            break
    }
}


export const startEventListener = async (baseURL: string) => {

    if (isEventListenerRunning) {
        console.log('🔌 Event listener already running')
        return
    }

    isEventListenerRunning = true
    console.log('🔌 Starting event listener...')

    // Infinite reconnection loop
    while (isEventListenerRunning) {
        try {
            const result = createSSEStream(baseURL)

            console.log('✅ Event listener connected')

            // Consume event stream
            for await (const event of result.stream) {
                if (!isEventListenerRunning) break
                handleSSEEvent(event)
            }

            // Stream ended normally
            if (isEventListenerRunning) {
                console.log('🔄 Stream ended, reconnecting in 3s...')
                await new Promise(resolve => setTimeout(resolve, 3000))
            }
        } catch (error) {
            console.error('❌ Event listener error:', error)
            if (isEventListenerRunning) {
                console.log('🔄 Reconnecting in 5s...')
                await new Promise(resolve => setTimeout(resolve, 5000))
            }
        }
    }

    console.log('🛑 Event listener stopped')
}

export const stopEventListener = () => {
    if (!isEventListenerRunning) {
        console.log('🔌 Event listener not running')
        return
    }
    console.log('🛑 Stopping event listener...')
    isEventListenerRunning = false
}

export const isEventListenerActive = () => isEventListenerRunning
