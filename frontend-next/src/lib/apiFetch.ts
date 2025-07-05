const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export async function apiFetch(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${path}`

    const headers = {
        ...options.headers,
        'x-ai-mode': typeof window !== 'undefined' ? localStorage.getItem('aiMode') || 'free' : 'free',
        'x-deepseek-key': typeof window !== 'undefined' ? localStorage.getItem('deepseekKey') || '' : '',
        ...(typeof window !== 'undefined' && localStorage.getItem('token') ? { 'Authorization': 'Bearer ' + localStorage.getItem('token') } : {})
    }

    return fetch(url, { ...options, headers })
}