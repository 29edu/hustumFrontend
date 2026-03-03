import React, { useState } from "react";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";

const AuthPage = ({
  onLogin,
  onRegister,
  initialView = "login",
  onBackToLanding,
}) => {
  const [view, setView] = useState(initialView);

  if (view === "register") {
    return (
      <Register
        onRegister={onRegister}
        onSwitchToLogin={() => setView("login")}
        onBackToLanding={onBackToLanding}
      />
    );
  }

  return (
    <Login
      onLogin={onLogin}
      onSwitchToRegister={() => setView("register")}
      onBackToLanding={onBackToLanding}
    />
  );
};

export default AuthPage;
