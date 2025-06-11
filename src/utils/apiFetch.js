import config from '../config';

export async function apiFetch(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${config.apiUrl}${endpoint}`;
    const headers = {
      ...options.headers,
      "x-ai-mode": localStorage.getItem("aiMode") || "free",
      "x-openai-key": localStorage.getItem("openaiKey") || ""
    };
  
    return fetch(url, { ...options, headers });
}
  