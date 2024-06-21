import React, { useContext, useState, createContext, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Asegúrate de usar la importación nombrada correctamente

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
          UserId: decodedToken.nameid,
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
      const response = await axios.post(
        "https://localhost:7166/api/Authenticate",
        { email, password }
      );
      const token = response.data;
      const decodedToken = jwtDecode(token);

      if (decodedToken.exp * 1000 > Date.now()) {
        saveTokenLS(token);
        setUser({
          UserId: decodedToken.nameid,
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

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        `https://localhost:7166/api/User/profile`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setUser((prevUser) => ({ ...prevUser, ...response.data }));
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const updateUser = async (updatedUser) => {
    try {
      const response = await axios.put(
        `https://localhost:7166/api/User/${user.UserId}`,
        updatedUser,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setUser((prevUser) => ({ ...prevUser, ...response.data }));
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
        fetchUserProfile,
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
