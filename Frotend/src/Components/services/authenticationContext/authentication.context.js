import React, { useContext, useState, createContext, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AuthenticationContext = createContext();
const TOKEN_KEY = "authToken";

export const AuthenticationContextProvider = ({ children }) => {
  const [user, setUser] = useState({
    UserId: 0,
    Email: "",
    UserName: "",
    UserType: "",
    token: "",
  });
  const [isLogin, setIsLogin] = useState(false);

  //Guardar token en local
  const saveTokenLS = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  };

  //Verificar token valido

  const checkTokenLS = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 > Date.now()) {
        setUser({
          UserId: decodedToken.sub,
          Email: decodedToken.email,
          UserType: decodedToken.role,
          UserName: decodedToken.name,
          token: token,
        });
        setIsLogin(true);
      }
    }
  };

  useEffect(() => {
    checkTokenLS();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "https://localhost:7166/api/Authenticate",
        {
          email,
          password,
        }
      );
      const token = response.data;
      const decodedToken = jwtDecode(token);

      // Verifica que la respuesta contenga un token válido antes de continuar
      if (decodedToken.exp * 1000 > Date.now()) {
        saveTokenLS(token);
        setUser({
          UserId: decodedToken.nameid,
          Email: decodedToken.email,
          UserName: decodedToken.name,
          UserType: decodedToken.role,
          token: token,
        });
        setIsLogin(true);
      } else {
        throw new Error("Invalid token");
      }
    } catch (error) {
      console.error("Error al iniciar sesión", error);
      throw error; // Lanza el error para que el componente Login lo maneje
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser({
      UserId: 0,
      Email: "",
      UserName: "",
      UserType: "",
      token: "",
    });
    setIsLogin(false);
  };

  return (
    <AuthenticationContext.Provider
      value={{ user, login, setUser, logout, isLogin }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
};
