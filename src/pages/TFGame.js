import React, { useState, useEffect } from "react";
import "../styles.css";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";

/**
 * True / False news game (AI-vs-Human)
 */
const TFGame = () => {
  /* game state */
  const [questions, setQuestions]   = useState([]);
  const [idx, setIdx]               = useState(0);
  const [selected, setSelected]     = useState(null);
  const [feedback, setFeedback]     = useState("");
  const [score, setScore]           = useState(0);

  /* ui state */
  const [loading, setLoading]       = useState(true);
  const [errorMsg, setErrorMsg]     = useState("");

  const navigate = useNavigate();

  /* fetch questions once */
  useEffect(() => {
    apiFetch("http://localhost:5000/api/generate-tf")
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(txt || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data.questions || !data.questions.length) {
          throw new Error(
            "No questions returned. " +
            "If you enabled the OpenAI model, please supply a valid API-Key in Settings."
          );
        }
        setQuestions(data.questions);
      })
      .catch((err) => {
        console.error("T/F question fetch error:", err);
        setErrorMsg(
          "Unable to start the game. " +
          "Please try again."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  /* helper – split prompt into title / content */
  const parsePrompt = (prompt) => {
    const lines = prompt.split("\n").map((l) => l.trim());
    let title = "", content = "";
    for (const l of lines) {
      if (l.toLowerCase().startsWith("title:"))   title   = l.slice(6).trim();
      else if (l.toLowerCase().startsWith("content:")) content = l.slice(8).trim();
    }
    if (!title && !content) {
      const m = prompt.match(/Title:\s*(.*?)\s*Content:\s*(.*)/i);
      if (m) { title = m[1]; content = m[2]; } else { title = prompt; }
    }
    return { title, content };
  };

  /* answer click */
  const handleAnswer = (ans) => {
    setSelected(ans);
    const correctIsHuman = questions[idx].correctAnswer === "True";
    const isRight = (correctIsHuman && ans === "human") || (!correctIsHuman && ans === "ai");
    setFeedback(isRight ? "✅ Correct!" : `❌ Incorrect. It was written by ${correctIsHuman ? "a Human." : "an AI."}`);
    if (isRight) setScore((s) => s + 1);
  };

  /* next / finish */
  const nextQuestion = async () => {
    if (idx + 1 < questions.length) {
      setIdx((i) => i + 1);
      setSelected(null);
      setFeedback("");
      return;
    }

    alert(`Game Over! Your score: ${score}/${questions.length}`);
    const token = localStorage.getItem("token");
    try {
      await apiFetch("http://localhost:5000/api/record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mode: "T/F", score, total: questions.length }),
      });
    } catch (e) {
      console.warn("Record save failed:", e);
    }
    navigate("/");
  };

  /* loading view */
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p className="loading-text">Loading Bot or Not…</p>
      </div>
    );
  }

  /* error view */
  if (errorMsg) {
    return (
      <div className="game-container">
        <h1 className="game-title">Oops!</h1>
        <p className="feedback">{errorMsg}</p>
        <button className="next-button" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    );
  }

  /* render question */
  const q = questions[idx];
  const { title, content } = parsePrompt(q.prompt);

  return (
    <div className="game-container">
      <h1 className="game-title">Bot or Not? – Human or AI?</h1>

      <div className="question-box">
        <p><strong>Title:</strong> {title}</p>
        <p><strong>Content:</strong> {content}</p>
      </div>

      <div className="options">
        {["human", "ai"].map((side) => (
          <button
            key={side}
            className={`option-card ${selected === side ? (side === "human"
              ? (q.correctAnswer === "True" ? "correct" : "incorrect")
              : (q.correctAnswer === "True" ? "incorrect" : "correct")) : ""}`}
            onClick={() => handleAnswer(side)}
            disabled={selected !== null}
          >
            {side === "human" ? "Human" : "AI"}
          </button>
        ))}
      </div>

      {feedback && <p className="feedback">{feedback}</p>}

      {selected && (
        <button className="next-button" onClick={nextQuestion}>
          Next Question
        </button>
      )}
    </div>
  );
};

export default TFGame;
