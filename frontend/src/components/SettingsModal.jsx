import React, { useState, useEffect } from "react";
import "./SettingsModal.css";

const SettingsModal = ({ onClose }) => {
  // ⇢ Use aiMode / openaiKey，to match with header of backend
  const [mode, setMode] = useState(localStorage.getItem("aiMode") || "free");
  const [customKey, setCustomKey] = useState(localStorage.getItem("openaiKey") || "");

  // When mode or key changed，write into localStorage
  useEffect(() => {
    localStorage.setItem("aiMode", mode);
    if (mode === "openai") {
      localStorage.setItem("openaiKey", customKey);
    } else {
      localStorage.removeItem("openaiKey");
    }
  }, [mode, customKey]);

  return (
    <div className="settings-modal-backdrop">
      <div className="settings-modal">
        <h2>Settings</h2>

        <label>
          <input
            type="radio"
            value="free"
            checked={mode === "free"}
            onChange={() => setMode("free")}
          />
          Use Free / Local Model
        </label>

        <label>
          <input
            type="radio"
            value="openai"
            checked={mode === "openai"}
            onChange={() => setMode("openai")}
          />
          Use My Own OpenAI&nbsp;API&nbsp;Key
        </label>

        {mode === "openai" && (
          <div>
            <input
              type="text"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              placeholder="Enter your OpenAI API Key"
            />
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onClose}>Save &amp; Close</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
