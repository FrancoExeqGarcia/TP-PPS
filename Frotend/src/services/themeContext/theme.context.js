import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
  // Inicializa el tema desde el almacenamiento local o usa 'claro' como predeterminado
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'claro');

  const toggleTheme = () => {
    const newTheme = theme === "claro" ? "oscuro" : "claro";
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme); // Guardar el tema en el almacenamiento local
  };

  useEffect(() => {
    document.body.className = theme; // Aplicar clase al body para controlar el tema global
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};