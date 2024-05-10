import React, { useState } from "react";

export const AuthenticationContext = React.createContext();

const userValue = JSON.parse(localStorage.getItem("user"));
const tokenValue = localStorage.getItem("token");
const roleValue = localStorage.getItem("userRole");

export const AuthenticationContextProvider = ({ children }) => {
  const [user, setUser] = useState(userValue);
  const [token, setToken] = useState(tokenValue);
  const [role, setRole] = useState(roleValue);

  const handleLogin = (email, role) => {
    localStorage.setItem("user", JSON.stringify({ email }));
    localStorage.setItem("token", "token");
    localStorage.setItem("userRole", role);
    setUser({ email });
    setToken("token");
    setRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setUser(null);
    setToken(null);
    setRole(null);
  };

  return (
    <AuthenticationContext.Provider
      value={{ user, token, role, handleLogin, handleLogout }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};
