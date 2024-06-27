import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App";
import { AuthenticationContextProvider } from "./services/authenticationContext/authentication.context";
import { APIContextProvider } from "./services/apiContext/API.Context";
import { ThemeContextProvider } from "./services/themeContext/theme.context";
import { TranslateContextProvider } from "../src/services/translationContext/translation.context";

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
