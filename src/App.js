import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Homepage from "./pages/Homepage";
import GamePage from "./pages/Gamepage";
import TFGame from "./pages/TFGame";
import LoginPage from "./pages/LoginPage";
import Leaderboard from "./pages/Leaderboard";
import ImageTFGame from "./pages/ImageTFGame";
import SubmitPage from "./pages/SubmitPage"; // add input pages
import { LanguageProvider } from './contexts/LanguageContext';


function App() {
  useEffect(() => {
    // automatically log out when page is closed
    const handleBeforeUnload = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // clean the cache
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <LanguageProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/game/:mode" element={<GamePage />} />
        <Route path="/tfgame" element={<TFGame />} />
        <Route path="/imagetf" element={<ImageTFGame />} />
        <Route path="/login" element={<LoginPage mode="login" />} />
        <Route path="/register" element={<LoginPage mode="register" />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/submit" element={<SubmitPage />} />  
      </Routes>
    </Router>
    </LanguageProvider>
  );
}

export default App;
