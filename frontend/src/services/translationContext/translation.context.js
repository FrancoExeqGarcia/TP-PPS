import { useState } from "react";
import { createContext } from "react";

export const TranslateContext = createContext(null);

const tValue = localStorage.getItem("translation");

export const TranslateContextProvider = ({ children }) => {
  const [language, setLanguage] = useState(tValue ?? "en");

  const changeLanguageHandler = (newLanguage) => {
    localStorage.setItem("translation", newLanguage);
    setLanguage(newLanguage);
  };
  return (
    <TranslateContext.Provider value={{ language, changeLanguageHandler }}>
      {children}
    </TranslateContext.Provider>
  );
};
