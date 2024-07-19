import "./App.css";
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";

import Login from "./Components/logIn/LogIn";
import Dashboard from "./Components/dashboard/ProjectCardDashboard";
import Protected from "./Components/security/protected/Protected";
import PageNotFound from "./Components/security/pageNotFound/PageNotFound";
import Forbidden from "./Components/security/forbidden/Forbidden";
import { ThemeContext } from "./services/themeContext/theme.context";
import { useContext, useState } from "react";
import { APIContext } from "./services/apiContext/API.Context";
import { Spinner } from "react-bootstrap";
import Profile from "./Components/profile/Profile";
import { useAuth } from "./services/authenticationContext/authentication.context";
import UserDashboard from "./Components/user/User";
import SearchProject from "./Components/searchProject/SearchProject";
import SearchTodos from "./Components/searchToDos/SearchTodos";

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
          <UserDashboard />
        </Protected>
      ),
    },
    {
      path: "/profile",
      element: (
        <Protected isSignedIn={isLogin}>
          <Profile />
        </Protected>
      ),
    },
    {
      path: "/projects",
      element: (
        <Protected isSignedIn={isLogin}>
          <SearchProject />
        </Protected>
      ),
    },
    {
      path: "/todos",
      element: (
        <Protected isSignedIn={isLogin}>
          <SearchTodos />
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
