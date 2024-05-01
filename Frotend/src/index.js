import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App";
import { AuthenticationContextProvider } from "./Components/services/authenticationContext/authentication.context";
import { APIContextProvider } from "./Components/services/apiContext/API.Context";
import { ThemeContextProvider } from "./Components/services/themeContext/theme.context";
import { TranslateContextProvider } from "./services/translationContext/translation.context";

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
