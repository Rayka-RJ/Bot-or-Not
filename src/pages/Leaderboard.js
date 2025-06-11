import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import { apiFetch } from "../utils/apiFetch";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../translations";

const modeLabels = {
  text: {
    en: "Text (Comment AI Guess)",
    zh: "文本（评论AI猜测）"
  },
  image: {
    en: "Image (AI vs Human)",
    zh: "图片（AI vs 人类）"
  },
  "T/F": {
    en: "T/F News Game",
    zh: "新闻真伪游戏"
  }
};

const Leaderboard = () => {
  const [data, setData] = useState({ top10ByMode: {}, myBest: {} });
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    const token = localStorage.getItem("token");
    apiFetch("/api/leaderboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setData);
  }, []);

  const renderBoard = (modeName, list) => (
    <div className="leaderboard-block" key={modeName}>
      <h2>{modeLabels[modeName][language]}</h2>
      <ol>
        {list.map((r, idx) => (
          <li key={idx}>
            {r.username} — {r.score}/{r.total}
          </li>
        ))}
      </ol>
      {data.myBest[modeName] && (
        <p className="your-score">
          {t.yourBest}: {data.myBest[modeName].score}/{data.myBest[modeName].total}
        </p>
      )}
    </div>
  );

  return (
    <div className="game-container">
      <h1 className="game-title">{t.leaderboard}</h1>
      <div className="leaderboard-wrapper">
        {["text", "image", "T/F"].map(mode =>
          renderBoard(mode, data.top10ByMode[mode] || [])
        )}
      </div>
      <button className="back-button" onClick={() => navigate("/")}>{t.backToHome}</button>
      </div>
  );
};

export default Leaderboard;
