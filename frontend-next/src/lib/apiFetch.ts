const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export async function apiFetch(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const url = endpoint.startsWith('http') ? endpoint : `/api/backend${path}`

    const headers = {
        ...options.headers,
        'x-ai-mode': typeof window !== 'undefined' ? localStorage.getItem('aiMode') || 'free' : 'free',
        'x-openai-key': typeof window !== 'undefined' ? localStorage.getItem('openaiKey') || '' : ''
    }

    return fetch(url, { ...options, headers })
}