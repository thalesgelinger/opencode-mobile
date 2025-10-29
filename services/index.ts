import { createOpencodeClient } from "@opencode-ai/sdk/client"

let opencodeClient = createOpencodeClient({
    baseUrl: ""
})

export const getOpencodeClient = () => opencodeClient

export const setBaseUrl = (url: string) => {
    opencodeClient = createOpencodeClient({
        baseUrl: url
    })
}

