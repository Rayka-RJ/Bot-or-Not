import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Homepage';
import GamePage from './pages/Gamepage';
import LoginPage from './pages/LoginPage';
import { LanguageProvider } from './contexts/LanguageContext';
import './index.css';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage mode="login" />} />
          <Route path="/register" element={<LoginPage mode="register" />} />
          <Route path="/game/:mode" element={<GamePage />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
};

export default App;

