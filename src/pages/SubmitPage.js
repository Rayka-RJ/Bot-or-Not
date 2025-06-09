import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

const SubmitPage = () => {
    const [news, setNews] = useState("");
    const [comment, setComment] = useState("");
    const [feedback, setFeedback] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback("");

        if (news.trim().length < 10 || comment.trim().length < 5) {
            setFeedback("❌ Please enter a meaningful and complete comments");
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/api/add-news", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ news, comment })
            });

            const result = await res.json();
            if (res.ok) {
                setFeedback("✅ Submit Successfully! Thanks for contribution.");
                setNews("");
                setComment("");
                setTimeout(() => navigate("/"), 2000);
            } else {
                setFeedback("❌ Error: " + result.error);
            }
        } catch (err) {
            setFeedback("❌ Connect error, please check out your network.");
        }
    };

    return (
        <div className="game-container">
            <h1 className="game-title">👻 Submit Your news & comments to cheat others!!!</h1>
            <form className="question-box" onSubmit={handleSubmit}>
                <label>News:</label>
                <textarea
                    value={news}
                    onChange={(e) => setNews(e.target.value)}
                    rows="4"
                    style={{ width: "100%", marginBottom: "15px" }}
                    placeholder="Please enter your news content..."
                />

                <label>Human comment：</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="2"
                    style={{ width: "100%", marginBottom: "15px" }}
                    placeholder="Please enter your comment..."
                />

                <button type="submit" className="next-button">Submit</button>
            </form>

            {feedback && <p className="feedback">{feedback}</p>}
        </div>
    );
};

export default SubmitPage;
