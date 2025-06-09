import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import { apiFetch } from "../utils/apiFetch";

const LoginPage = ({ mode }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submit = async () => {
    const res = await apiFetch(`http://localhost:5000/api/${mode}`, {
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
      } else if (mode === "register") {
        // After register, go to login page
        navigate("/login");
      }
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="login-container" autoComplete="off">
        <h1>{mode === "login" ? "Login" : "Register"}</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <button onClick={submit}>
          {mode === "login" ? "Login" : "Register"}
        </button>
    </div>
  );
};

export default LoginPage;
