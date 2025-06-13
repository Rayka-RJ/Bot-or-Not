import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import { apiFetch } from "../lib/apiFetch";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../i18n/translations";

interface LoginPageProps {
  mode: 'login' | 'register';
}

const LoginPage: React.FC<LoginPageProps> = ({ mode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  const submit = async () => {
    const res = await apiFetch(`/api/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) {
      if (mode === "login") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        navigate("/");
      } else {
        navigate("/login");
      }
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="login-container">
      <h1>{mode === "login" ? t.login : t.register}</h1>

      <input
        type="text"
        placeholder={t.username}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
      />

      <input
        type="password"
        placeholder={t.password}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
      />

      <button onClick={submit}>
        {mode === "login" ? t.login : t.register}
      </button>
    </div>
  );
};

export default LoginPage;
