import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import SettingsModal from "../components/SettingsModal";


const Homepage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [showSettings, setShowSettings] = useState(false); 
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
              <span>Welcome, {username}!</span>
              <button className="mini-button" onClick={logout}>Logout</button>
              <button className="mini-button" onClick={() => navigate("/leaderboard")}>Leaderboard</button>
              <button className="mini-button" onClick={() => setShowSettings(true)}>Settings</button>
            </>
          ) : (
            <>
              <button className="mini-button" onClick={() => navigate("/login")}>Login</button>
              <button className="mini-button" onClick={() => navigate("/register")}>Register</button>
              <button className="mini-button" onClick={() => setShowSettings(true)}>Settings</button>
            </>
          )}
        </div>
      </div>

      <div className="homepage-container">
        <img src="/logo.png" alt="Bot or Not Logo" className="logo" />
        <h1 className="homepage-title">Bot or Not?</h1>
        <p className="homepage-description">Can you tell AI from a human?</p>

        <button 
          className="homepage-button" 
          onClick={() => navigate("/game/text")}
        >
          Play Text Recognition Game
        </button>

        <button 
          className="homepage-button" 
          onClick={() => navigate("/imagetf")}
        >
          Play True/False Image Game
        </button>

        <button 
          className="homepage-button" 
          onClick={() => navigate("/tfgame")}
        >
          Play True/False News Game
        </button>

        <button
          className="homepage-button"
          onClick={() => navigate("/submit")}
        >
          😎 Submit Your News & Comment to cheat others!
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
