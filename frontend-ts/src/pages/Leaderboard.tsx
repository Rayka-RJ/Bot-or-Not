// Leaderboard.tsx – 排行榜页面

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import { apiFetch } from "../lib/apiFetch";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../i18n/translations";
import { Score } from "../types";

interface LeaderboardData {
  top10ByMode: Record<string, Score[]>;
  myBest: Record<string, Score>;
}

const MODES = ["text", "image", "T/F"] as const;
type ModeKey = typeof MODES[number];

const modeLabels: Record<ModeKey, Record<"en" | "zh", string>> = {
  text: { en: "Text (Comment AI Guess)", zh: "文本（评论AI猜测）" },
  image: { en: "Image (AI vs Human)", zh: "图片（AI vs 人类）" },
  "T/F": { en: "T/F News Game", zh: "新闻真伪游戏" },
};

const Leaderboard: React.FC = () => {
  const [data, setData] = useState<LeaderboardData>({ top10ByMode: {}, myBest: {} });
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    const token = localStorage.getItem("token");
    apiFetch("/api/leaderboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("Leaderboard fetch failed:", err));
  }, []);

  return (
    <div className="game-container">
      <h1 className="game-title">{t.leaderboard}</h1>
      <div className="leaderboard-wrapper">
        {MODES.map((mode) => (
          <div className="leaderboard-block" key={mode}>
            <h2>{modeLabels[mode][language]}</h2>
            <ol>
              {(data.top10ByMode[mode] || []).map((r, idx) => (
                <li key={idx}>
                  {r.username} — {r.score}/{r.total}
                </li>
              ))}
            </ol>
            {data.myBest[mode] && (
              <p className="your-score">
                {t.yourBest}: {data.myBest[mode].score}/{data.myBest[mode].total}
              </p>
            )}
          </div>
        ))}
      </div>
      <button className="back-button" onClick={() => navigate("/")}>
        {t.backToHome}
      </button>
    </div>
  );
};

export default Leaderboard;