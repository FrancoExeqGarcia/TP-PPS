import { createContext, useState } from "react";
export const ThemeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
  const [theme, setTheme] = useState("claro");

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "claro" ? "oscuro" : "claro"));
  };

  return (
    <ThemeContext.Provider value={{ toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
