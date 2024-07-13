import React, { useContext, useState, createContext, useEffect } from "react";
import {jwtDecode} from "jwt-decode";
import axiosInstance from "../../data/axiosConfig";

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

  const saveTokenLS = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  };

  const checkTokenLS = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 > Date.now()) {
        setUser({
          UserId: decodedToken.sub,
          Email: decodedToken.email,
          UserName: decodedToken.username,
          UserType: decodedToken.role,
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
      const response = await axiosInstance.post("/Authenticate", {
        email,
        password,
      });
      const token = response.data;
      const decodedToken = jwtDecode(token);

      if (decodedToken.exp * 1000 > Date.now()) {
        saveTokenLS(token);
        setUser({
          UserId: decodedToken.sub,
          Email: decodedToken.email,
          UserName: decodedToken.username,
          UserType: decodedToken.role,
          token: token,
        });
        setIsLogin(true);
      } else {
        throw new Error("Invalid token");
      }
    } catch (error) {
      console.error("Error al iniciar sesión", error);
      throw error;
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

  const updateUser = async (updatedUser) => {
    try {
      const response = await axiosInstance.put(`/User/${user.UserId}`, updatedUser);
      const updatedData = response.data;

      setUser((prevUser) => ({
        ...prevUser,
        UserName: updatedData.userName,
        Email: updatedData.email,
      }));
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  return (
    <AuthenticationContext.Provider
      value={{
        user,
        login,
        setUser,
        logout,
        isLogin,
        updateUser,
      }}
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
