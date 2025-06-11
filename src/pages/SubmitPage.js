import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../translations";

const SubmitPage = () => {
    const [news, setNews] = useState("");
    const [comment, setComment] = useState("");
    const [feedback, setFeedback] = useState("");
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback("");

        if (news.trim().length < 10 || comment.trim().length < 5) {
            setFeedback("❌ " + t.submitError + " " + t.submitValidation);
            return;
        }

        try {
            const res = await fetch("/api/add-news", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ news, comment, language })
            });

            const result = await res.json();
            if (res.ok) {
                setFeedback("✅ " + t.submitSuccess);
                setNews("");
                setComment("");
                setTimeout(() => navigate("/"), 2000);
            } else {
                setFeedback("❌ " + t.submitError + " " + result.error);
            }
        } catch (err) {
            setFeedback("❌ " + t.networkError);
        }
    };

    return (
        <div className="game-container">
            <h1 className="game-title">{t.submitTitle}</h1>
            <form className="question-box" onSubmit={handleSubmit}>
                <label>{t.news}:</label>
                <textarea
                    value={news}
                    onChange={(e) => setNews(e.target.value)}
                    rows="4"
                    style={{ width: "100%", marginBottom: "15px" }}
                    placeholder={t.newsPlaceholder}
                />

                <label>{t.comment}：</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="2"
                    style={{ width: "100%", marginBottom: "15px" }}
                    placeholder={t.commentPlaceholder}
                />

                <button type="submit" className="next-button">{t.submit}</button>
            </form>

            {feedback && <p className="feedback">{feedback}</p>}
        </div>
    );
};

export default SubmitPage;
