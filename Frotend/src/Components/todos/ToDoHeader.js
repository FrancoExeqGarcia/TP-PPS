import React, { useContext } from "react";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { ThemeContext } from "../../services/themeContext/theme.context";

const ToDoHeader = ({ setIsAdding, setSelectedProjectId }) => {
  const translate = useTranslation();
  const { theme } = useContext(ThemeContext);
  const className = `h1 ${
    theme === "oscuro" ? "dark-theme" : "light-theme"
  }`;

  return (
    <header>
      <h1 className={className}>{translate("Todo List")}</h1>
      <div style={{ marginTop: "30px", marginBottom: "18px" }}>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          {translate("Add ToDo")}
        </button>
      </div>
    </header>
  );
};

export default ToDoHeader;
