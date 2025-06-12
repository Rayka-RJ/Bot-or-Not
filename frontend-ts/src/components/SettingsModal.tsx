import React, { useState } from "react";
import "./SettingsModal.css";

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [mode, setMode] = useState(localStorage.getItem("aiMode") || "free");
  const [customKey, setCustomKey] = useState(localStorage.getItem("openaiKey") || "");

  const handleSave = () => {
    localStorage.setItem("aiMode", mode);
    localStorage.setItem("openaiKey", customKey);
    onClose();
  };

  return (
    <div className="settings-modal-backdrop">
      <div className="settings-modal">
        <h2>Settings</h2>

        <div className="form-group">
          <label htmlFor="aiMode">AI Mode:</label>
          <select
            id="aiMode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="free">Free</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="openaiKey">OpenAI Key:</label>
          <input
            id="openaiKey"
            type="text"
            value={customKey}
            onChange={(e) => setCustomKey(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
