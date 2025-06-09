export async function apiFetch(url, options = {}) {
    const headers = {
      ...options.headers,
      "x-ai-mode":   localStorage.getItem("aiMode")   || "free",
      "x-openai-key": localStorage.getItem("openaiKey") || ""
    };
  
    return fetch(url, { ...options, headers });
  }
  