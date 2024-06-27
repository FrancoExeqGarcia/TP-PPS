import { createContext, useState } from "react";

export const APIContext = createContext();

export const APIContextProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const toggleLoading = (value) => {
    setIsLoading(value);
  };

  return (
    <APIContext.Provider value={{ isLoading, toggleLoading }}>
      {children}
    </APIContext.Provider>
  );
};
