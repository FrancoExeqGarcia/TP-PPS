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
import { ThemeContext } from "./Components/services/themeContext/theme.context";
import { useContext, useState } from "react";
import {
  APIContext,
  APIContextProvider,
} from "./Components/services/apiContext/API.Context";
import { Spinner } from "react-bootstrap";
import UserManagement from "./Components/UserManagement/UserManagement";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { theme } = useContext(ThemeContext);
  const { isLoading } = useContext(APIContext);

  const loginHandler = () => {
    setIsLoggedIn(true);
  };

  const logoutHandler = () => {
    setIsLoggedIn(false);

  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Navigate to="/login" replace />,
    },
    {
      path: "/login",
      element: <Login onLoggedIn={loginHandler}/>,
    },
    {
      path: "/home",
      element: (
         <Protected isSignedIn={isLoggedIn}>
          <Dashboard onLogout={logoutHandler} />
        </Protected>
      ),
    },
    {
      path: "/users",
      element: (
         <Protected isSignedIn={isLoggedIn}>
          <UserManagement/>
        </Protected>
      ),
    },
    {
      path: "*",
      element: <PageNotFound />,
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
