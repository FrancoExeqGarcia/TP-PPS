import React, {useContext } from "react";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { ThemeContext } from "../../services/themeContext/theme.context";
import { useAuth } from "../../services/authenticationContext/authentication.context";

const ProjectHeader = ({ setIsAdding, setIsAuthenticated }) => {
  const translate = useTranslation();
  const { user } = useAuth();
  const { theme } = useContext(ThemeContext);
  const className = `h1 ${
    theme === "oscuro" ? "dark-theme" : "light-theme"
  }`;
  return (
    <header>
      <h1 className={className}>{translate("Projects")}</h1>
      <div style={{ marginTop: "30px", marginBottom: "18px" }}>
      {user.UserType === "SuperAdmin" || user.UserType === "Admin"} (
        <button onClick={() => setIsAdding(true)} className="btn btn-primary">
          {translate("Add Project")}
        </button>
        )
      </div>
    </header>
  );
};

export default ProjectHeader;
