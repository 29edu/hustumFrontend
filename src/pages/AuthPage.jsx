import React, { useState } from "react";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";

const AuthPage = ({ onLogin, onRegister }) => {
  const [view, setView] = useState("login");

  if (view === "register") {
    return (
      <Register
        onRegister={onRegister}
        onSwitchToLogin={() => setView("login")}
      />
    );
  }

  return (
    <Login onLogin={onLogin} onSwitchToRegister={() => setView("register")} />
  );
};

export default AuthPage;
