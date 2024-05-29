import "./App.css";
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";

import Login from "./Components/logIn/LogIn";
import Dashboard from "./Components/dashboard/Dashboard";
import Protected from "./Components/security/protected/Protected";
import PageNotFound from "./Components/security/pageNotFound/PageNotFound";
import Forbidden from "./Components/security/forbidden/Forbidden";
import { ThemeContext } from "./Components/services/themeContext/theme.context"; //fijar c
import { useContext, useState } from "react";
import {
  APIContext,
  APIContextProvider,
} from "./Components/services/apiContext/API.Context"; //fijar c
import { Spinner } from "react-bootstrap";
import UserManagement from "./Components/UserManagement/UserManagement";
import Profile from "./Components/profile/Profile";
import { useAuth } from "./Components/services/authenticationContext/authentication.context";

function App() {
  const { isLogin, setIsLogin } = useAuth();
  const { theme } = useContext(ThemeContext);
  const { isLoading } = useContext(APIContext);

  const loginHandler = () => {
    setIsLogin(true);
  };

  const logoutHandler = () => {
    setIsLogin(false);
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Navigate to="/login" replace />,
    },
    {
      path: "/login",
      element: <Login onLoggedIn={loginHandler} />,
    },
    {
      path: "/home",
      element: (
        <Protected isSignedIn={isLogin}>
          <Dashboard onLogout={logoutHandler} />
        </Protected>
      ),
    },
    {
      path: "/users",
      element: (
        <Protected isSignedIn={isLogin} requiredRole={"SuperAdmin"}>
          <UserManagement />
        </Protected>
      ),
    },
    {
      path: "/profile", // Añade esta nueva ruta
      element: (
        <Protected isSignedIn={isLogin}>
          <Profile />
        </Protected>
      ),
    },
    {
      path: "*",
      element: <PageNotFound />,
    },
    {
      path: "/forbidden",
      element: <Forbidden />,
    },
  ]);
  return (
    <div
      className={`App ${theme === "oscuro" && "dark-theme"} ${
        isLoading && "opacity-80"
      }`}
    >
      {isLoading && <Spinner />}
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
