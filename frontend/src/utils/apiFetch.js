import config from '../config';

export async function apiFetch(endpoint, options = {}) {
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    //complete url or base URL
    const url = endpoint.startsWith('http') ? endpoint : `${config.apiUrl}${path}`;
    
    const headers = {
      ...options.headers,
      "x-ai-mode": localStorage.getItem("aiMode") || "free",
      "x-openai-key": localStorage.getItem("openaiKey") || ""
    };
  
    return fetch(url, { ...options, headers });
}
  