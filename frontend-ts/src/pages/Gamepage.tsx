import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles.css";
import { apiFetch } from "../lib/apiFetch";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../i18n/translations";
import { MultiChoiceQuestion, Option } from "../types";

/**
 * GamePage – multiple-choice text mode (fallback redirects image mode to /imagetf)
 */
const GamePage: React.FC = () => {
  const { mode } = useParams<{ mode?: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  // basic game state
  const [questions, setQuestions] = useState<MultiChoiceQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<Option | null>(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);

  // ui state
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /* Redirect "/game/image" to the dedicated T/F image game */
  useEffect(() => {
    if (mode === "image") {
      navigate("/imagetf", { replace: true });
      return;
    }

    if (hasFetched) return;
    setHasFetched(true);

    apiFetch(`/api/generate-multi?lang=${language}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        if (!data.questions?.length) throw new Error("No questions returned.");
        setQuestions(data.questions);
      })
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setLoading(false));
  }, [mode, hasFetched, navigate, language]);

  /* Handle answer click */
  const handleAnswerClick = (option: Option) => {
    if (!questions[current]) return;
    setSelected(option);
    const correct = questions[current].correctAnswer;
    setFeedback(option.source === correct ? t.correct : t.incorrect);
    if (option.source === correct) setScore((s) => s + 1);
  };

  /* Move to next question or finish the game */
  const nextQuestion = async () => {
    if (current + 1 < questions.length) {
      setCurrent((i) => i + 1);
      setSelected(null);
      setFeedback("");
    } else {
      alert(`${t.gameOver} ${score}/${questions.length}`);
      try {
        const token = localStorage.getItem("token");
        await apiFetch("/api/record", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ mode: "text", score, total: questions.length }),
        });
      } catch (e) {
        console.warn("Save failed:", e);
      }
      navigate("/");
    }
  };

  /* Loading screen */
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p className="loading-text">{t.loading}</p>
      </div>
    );
  }

  /* Error screen */
  if (errorMsg) {
    return (
      <div className="game-container">
        <h1 className="game-title">{t.textRecognitionGame}</h1>
        <p className="feedback">{errorMsg}</p>
        <button className="next-button" onClick={() => navigate("/")}>
          {t.backToHome}
        </button>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="game-container">
      <h1 className="game-title">{t.textRecognitionGame}</h1>

      <div className="question-box">
        <p>{q.prompt}</p>
      </div>

      <div className="options">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswerClick(opt)}
            disabled={!!selected}
            className={`option-card ${selected === opt
              ? opt.source === q.correctAnswer
                ? "correct"
                : "incorrect"
              : ""
              }`}
          >
            {opt.text}
          </button>
        ))}
      </div>

      {feedback && <p className="feedback">{feedback}</p>}

      {selected && (
        <button className="next-button" onClick={nextQuestion}>
          {t.nextQuestion}
        </button>
      )}
    </div>
  );
};

export default GamePage;