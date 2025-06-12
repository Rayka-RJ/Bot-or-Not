// ImageTFGame.tsx – 判断图片是真人还是AI画的

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import { apiFetch } from "../lib/apiFetch";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../i18n/translations";
import { ImageQuestion } from "../types";

const ImageTFGame: React.FC = () => {
  const [questions, setQuestions] = useState<ImageQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<"ai" | "human" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    apiFetch(`/api/generate-image-tf?lang=${language}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading image T/F questions:", err);
        setLoading(false);
      });
  }, [language]);

  const current = questions[currentIndex];

  const handleAnswer = (answer: "ai" | "human") => {
    setSelected(answer);
    if (answer === current.correctAnswer) {
      setFeedback(t.correct);
      setScore((s) => s + 1);
    } else {
      setFeedback(`${t.incorrect} ${current.correctAnswer === "ai" ? t.ai : t.human}`);
    }
  };

  const next = async () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelected(null);
      setFeedback("");
    } else {
      alert(`${t.gameOver} ${score}/${questions.length}`);
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await apiFetch("/api/record", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ mode: "image", score, total: questions.length }),
          });
        } catch (err) {
          console.error("Error saving result:", err);
        }
      }
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p className="loading-text">{t.loading}</p>
      </div>
    );
  }

  if (!current) return <p>{t.loading}</p>;

  return (
    <div className="game-container">
      <h1 className="game-title">{t.imageGameTitle}</h1>

      <div className="question-box">
        <img src={current.imageUrl} alt="Guess" className="game-image" />
        <p><em>{current.description}</em></p>
      </div>

      <div className="options">
        {["human", "ai"].map((side) => (
          <button
            key={side}
            className={`option-card ${selected === side ? "selected" : ""}`}
            onClick={() => handleAnswer(side as "ai" | "human")}
            disabled={selected !== null}
          >
            {side === "human" ? t.human : t.ai}
          </button>
        ))}
      </div>

      {feedback && <p className="feedback">{feedback}</p>}

      {selected !== null && (
        <button className="next-button" onClick={next}>
          {t.nextQuestion}
        </button>
      )}
    </div>
  );
};

export default ImageTFGame;