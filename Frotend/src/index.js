import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App";
import { AuthenticationContextProvider } from "./Components/services/authenticationContext/authentication.context"; // fijar c
import { APIContextProvider } from "./Components/services/apiContext/API.Context"; //fijar c
import { ThemeContextProvider } from "./Components/services/themeContext/theme.context"; //fijar c
import { TranslateContextProvider } from "../src/Components/services/translationContext/translation.context"; //fijar s

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <APIContextProvider>
    <TranslateContextProvider>
      <ThemeContextProvider>
        <AuthenticationContextProvider>
          <App />
        </AuthenticationContextProvider>
      </ThemeContextProvider>
    </TranslateContextProvider>
  </APIContextProvider>
);
