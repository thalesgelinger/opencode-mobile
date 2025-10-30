import { createOpencodeClient } from "@opencode-ai/sdk/client"
import type { FileDiff } from "@opencode-ai/sdk"

let opencodeClient = createOpencodeClient({
    baseUrl: ""
})

export const getOpencodeClient = () => opencodeClient

export const setBaseUrl = (url: string) => {
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
