import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles.css";
import { apiFetch } from "../utils/apiFetch";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../translations";

/**
 * GamePage – multiple-choice text mode (fallback redirects image mode to /imagetf)
 */
const GamePage = () => {
  const { mode } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  // basic game state
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
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
        if (!res.ok) {
          // attempt to read backend error; default fallback
          const txt = await res.text().catch(() => "");
          throw new Error(txt || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data.questions || !data.questions.length) {
          throw new Error("No questions returned – check your API-Key settings.");
        }
        setQuestions(data.questions);
      })
      .catch((err) => {
        console.error("Failed to load questions:", err);
        setErrorMsg(
          "Unable to start the game. " +
          "Please try again."
        );
      })
      .finally(() => setLoading(false));
  }, [mode, hasFetched, navigate, language]);

  /* Handle answer click */
  const handleAnswerClick = (option) => {
    setSelected(option);
    const isCorrect = option.source === questions[current].correctAnswer;
    setFeedback(isCorrect ? t.correct : t.incorrect);
    if (isCorrect) setScore((s) => s + 1);
  };

  /* Move to next question or finish the game */
  const nextQuestion = async () => {
    if (current + 1 < questions.length) {
      setCurrent((idx) => idx + 1);
      setSelected(null);
      setFeedback("");
      return;
    }

    alert(`${t.gameOver} ${score}/${questions.length}`);
    const token = localStorage.getItem("token");
    try {
      await apiFetch("/api/record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mode: "text", score, total: questions.length }),
      });
    } catch (e) {
      console.warn("Record save failed:", e);
    }
    navigate("/");
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

  /* Error screen (missing key, backend 400, etc.) */
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

  /* Main game UI */
  const q = questions[current];
  return (
    <div className="game-container">
      <h1 className="game-title">{t.textRecognitionGame}</h1>

      <div className="question-box">
        <p>{q.prompt}</p>
      </div>

      <div className="options">
        {(q.options || []).map((opt, idx) => (
          <button
            key={idx}
            className={`option-card ${
              selected === opt
                ? opt.source === q.correctAnswer
                  ? "correct"
                  : "incorrect"
                : ""
            }`}
            onClick={() => handleAnswerClick(opt)}
            disabled={!!selected}
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
