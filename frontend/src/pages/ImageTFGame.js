import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import { apiFetch } from "../utils/apiFetch";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../translations";

const ImageTFGame = () => {
  // State to hold all fetched questions
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // Current question index
  const [selected, setSelected] = useState(null);       // User's current selection
  const [feedback, setFeedback] = useState("");         // Feedback message
  const [score, setScore] = useState(0);                // User's score
  const [loading, setLoading] = useState(true);         // Loading state
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  // Fetch questions from backend when component mounts
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

  // Get the current question
  const current = questions[currentIndex];

  // Handle user's answer selection
  const handleAnswer = (answer) => {
    setSelected(answer);
    if (answer === current.correctAnswer) {
      setFeedback(t.correct);
      setScore(score + 1);
    } else {
      setFeedback(`${t.incorrect} ${current.correctAnswer === "ai" ? t.ai : t.human}`);
    }
  };

  const token = localStorage.getItem("token");
  console.log("Token being used:", token);

  // Move to next question or end game
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
          const res = await apiFetch("/api/record", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              mode: "image",
              score,
              total: questions.length,
            }),
          });

          if (!res.ok) {
            console.warn("Failed to save image game result:", await res.text());
          } else {
            console.log("Record saved successfully.");
          }
        } catch (err) {
          console.error("Error saving result:", err);
        }
      } else {
        console.warn("No token found, skipping record save.");
      }

      navigate("/");
    }
  };

  // Display loading spinner while fetching questions
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">{t.loading}</p>
      </div>
    );
  }

  // Handle edge case where no questions were returned
  if (!current) return <p>{t.loading}</p>;

  // Main game UI
  return (
    <div className="game-container">
      <h1 className="game-title">{t.imageGameTitle}</h1>

      <div className="question-box">
        <img src={current.imageUrl} alt="Guess" className="game-image" />
        <p><em>{current.description}</em></p>
      </div>

      <div className="options">
        <button
          className={`option-card ${selected === "human" ? "selected" : ""}`}
          onClick={() => handleAnswer("human")}
          disabled={selected !== null}
        >
          {t.human}
        </button>
        <button
          className={`option-card ${selected === "ai" ? "selected" : ""}`}
          onClick={() => handleAnswer("ai")}
          disabled={selected !== null}
        >
          {t.ai}
        </button>
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
