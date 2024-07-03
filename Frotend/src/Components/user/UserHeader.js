import React, { useContext } from "react";
import LogOut from "../logOut/LogOut";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { ThemeContext } from "../../services/themeContext/theme.context";

const UserHeader = ({ setIsAdding, setIsAuthenticated }) => {
  const translate = useTranslation();
  const { theme } = useContext(ThemeContext);
  const className = `h1 ${
    theme === "oscuro" ? "dark-theme" : "light-theme"
  }`;

  return (
    <header>
      <h1 className={className}>{translate("Users")}</h1>
      <div style={{ marginTop: "30px", marginBottom: "18px" }}>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          {translate("Add User")}
        </button>
        <LogOut
          setIsAuthenticated={setIsAuthenticated}
          className="btn btn-primary"
        />
      </div>
    </header>
  );
};

export default UserHeader;
