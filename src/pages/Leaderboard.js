import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import { apiFetch } from "../utils/apiFetch";

const modeLabels = {
  text: "Text (Comment AI Guess)",
  image: "Image (AI vs Human)",
  "T/F": "T/F News Game"
};

const Leaderboard = () => {
  const [data, setData] = useState({ top10ByMode: {}, myBest: {} });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    apiFetch("http://localhost:5000/api/leaderboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setData);
  }, []);

  const renderBoard = (modeName, list) => (
    <div className="leaderboard-block" key={modeName}>
      <h2>{modeName} Mode</h2>
      <ol>
        {list.map((r, idx) => (
          <li key={idx}>
            {r.username} — {r.score}/{r.total}
          </li>
        ))}
      </ol>
      {data.myBest[modeName] && (
        <p className="your-score">
          Your best: {data.myBest[modeName].score}/{data.myBest[modeName].total}
        </p>
      )}
    </div>
  );

  return (
    <div className="game-container">
      <h1 className="game-title">Leaderboard</h1>
      <div className="leaderboard-wrapper">
        {["text", "image", "T/F"].map(mode =>
          renderBoard(modeLabels[mode], data.top10ByMode[mode] || [])
        )}
      </div>
      <button className="back-button" onClick={() => navigate("/")}>Back to Home</button>
      </div>
  );
};

export default Leaderboard;
