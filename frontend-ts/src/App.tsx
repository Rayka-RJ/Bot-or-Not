import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Homepage';
import GamePage from './pages/Gamepage';
import TFGame from './pages/TFGame';
import LoginPage from './pages/LoginPage';
import Leaderboard from './pages/Leaderboard';
import ImageTFGame from './pages/ImageTFGame';
import SubmitPage from './pages/SubmitPage';
import { LanguageProvider } from './contexts/LanguageContext';
import './index.css';

const App: React.FC = () => {
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/:mode" element={<GamePage />} />
          <Route path="/tfgame" element={<TFGame />} />
          <Route path="/imagetf" element={<ImageTFGame />} />
          <Route path="/login" element={<LoginPage mode="login" />} />
          <Route path="/register" element={<LoginPage mode="register" />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/submit" element={<SubmitPage />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
};

export default App;

