import { createContext, useState } from "react";

export const ThemeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
  const [theme, setTheme] = useState("LIGHT");

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "LIGHT" ? "DARK" : "LIGHT"));
  };

  return (
    <ThemeContext.Provider value={{ toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};