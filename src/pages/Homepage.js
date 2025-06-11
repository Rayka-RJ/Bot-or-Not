import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import SettingsModal from "../components/SettingsModal";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../translations";

const Homepage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    const user = localStorage.getItem("username");
    if (user) setUsername(user);
  }, []);

  const logout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    setUsername("");
    navigate("/");
  };

  return (
    <>
      <div className="homepage-header">
        <div className="user-info">
          {username ? (
            <>
              <span>{t.welcome}, {username}!</span>
              <button className="mini-button" onClick={logout}>{t.logout}</button>
              <button className="mini-button" onClick={() => navigate("/leaderboard")}>{t.leaderboard}</button>
              <button className="mini-button" onClick={() => setShowSettings(true)}>{t.settings}</button>
            </>
          ) : (
            <>
              <button className="mini-button" onClick={() => navigate("/login")}>{t.login}</button>
              <button className="mini-button" onClick={() => navigate("/register")}>{t.register}</button>
              <button className="mini-button" onClick={() => setShowSettings(true)}>{t.settings}</button>
            </>
          )}
          <button className="mini-button" onClick={toggleLanguage}>
            {language === 'en' ? t.switchToChinese : t.switchToEnglish}
          </button>
        </div>
      </div>

      <div className="homepage-container">
        <img src="/logo.png" alt="Bot or Not Logo" className="logo" />
        <h1 className="homepage-title">{t.homepageTitle}</h1>
        <p className="homepage-description">{t.homepageDescription}</p>

        <button 
          className="homepage-button" 
          onClick={() => navigate("/game/text")}
        >
          {t.playTextGame}
        </button>

        <button 
          className="homepage-button" 
          onClick={() => navigate("/imagetf")}
        >
          {t.playImageGame}
        </button>

        <button 
          className="homepage-button" 
          onClick={() => navigate("/tfgame")}
        >
          {t.playNewsGame}
        </button>

        <button
          className="homepage-button"
          onClick={() => navigate("/submit")}
        >
          {t.submitNews}
        </button>
      </div>

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
};

export default Homepage;
