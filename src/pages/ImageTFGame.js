import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import { apiFetch } from "../utils/apiFetch";

const ImageTFGame = () => {
  // State to hold all fetched questions
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // Current question index
  const [selected, setSelected] = useState(null);       // User's current selection
  const [feedback, setFeedback] = useState("");         // Feedback message
  const [score, setScore] = useState(0);                // User's score
  const [loading, setLoading] = useState(true);         // Loading state
  const navigate = useNavigate();

  // Fetch questions from backend when component mounts
  useEffect(() => {
    apiFetch("http://localhost:5000/api/generate-image-tf")
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading image T/F questions:", err);
        setLoading(false);
      });
  }, []);

  // Get the current question
  const current = questions[currentIndex];

  // Handle user's answer selection
  const handleAnswer = (answer) => {
    setSelected(answer);
    if (answer === current.correctAnswer) {
      setFeedback("Correct!");
      setScore(score + 1);
    } else {
      setFeedback(`Incorrect. It was by a ${current.correctAnswer === "ai" ? "AI" : "Human"}.`);
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
      alert(`Game Over! Your score: ${score}/${questions.length}`);

      const token = localStorage.getItem("token");

      if (token) {
        try {
          const res = await apiFetch("http://localhost:5000/api/record", {
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
        <p className="loading-text">Loading Image Game...</p>
      </div>
    );
  }

  // Handle edge case where no questions were returned
  if (!current) return <p>No questions available.</p>;

  // Main game UI
  return (
    <div className="game-container">
      <h1 className="game-title">Is this image from a Human or AI?</h1>

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
          Human
        </button>
        <button
          className={`option-card ${selected === "ai" ? "selected" : ""}`}
          onClick={() => handleAnswer("ai")}
          disabled={selected !== null}
        >
          AI
        </button>
      </div>

      {feedback && <p className="feedback">{feedback}</p>}

      {selected !== null && (
        <button className="next-button" onClick={next}>
          Next Image
        </button>
      )}
    </div>
  );
};

export default ImageTFGame;
