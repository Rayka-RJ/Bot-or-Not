export async function apiFetch(url, options = {}) {
    const headers = {
      ...options.headers,
      "x-ai-mode":   localStorage.getItem("aiMode")   || "free",
      "x-openai-key": localStorage.getItem("openaiKey") || ""
    };
  
  return fetch(`https://bot-or-not-jz7o.onrender.com${url}`, { ...options, headers });
  }
  