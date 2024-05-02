import { useState } from "react";

const { createContext } = require("react");

export const AuthenticationContext = createContext();
//**************************************************************************************************************************
//Cuando se use el TOKEN simplemente modificar handleLogin para guardar el token y actualizar el estado token en lugar de user
//************************************************************************************************************************** */
const userValue = JSON.parse(localStorage.getItem("user"));
const tokenValue = localStorage.getItem("token");
const roleValue = parseInt(localStorage.getItem("role"));

export const AuthenticationContextProvider = ({ children }) => {
  const [user, setUser] = useState(userValue);
  const [token, setToken] = useState(tokenValue);
  const [role, setRole] = useState(roleValue);

  const handleLogin = (email, token) => {
    localStorage.setItem("user", JSON.stringify({ ...user, email }));
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    setUser({ ...user, email });
    setToken(token);
    setRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
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
