const BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

export async function apiFetch(url, options = {}) {
    const headers = {
      ...options.headers,
      "x-ai-mode":   localStorage.getItem("aiMode")   || "free",
      "x-openai-key": localStorage.getItem("openaiKey") || ""
    };
  
    return fetch(url, { ...options, headers });
  }
  