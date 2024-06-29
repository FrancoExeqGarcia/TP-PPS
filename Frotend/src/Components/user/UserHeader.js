import React from "react";
import LogOut from "../logOut/LogOut";
import useTranslation from "../../custom/useTranslation/useTranslation";

const UserHeader = ({ setIsAdding, setIsAuthenticated }) => {
  const translate = useTranslation();

  return (
    <header>
      <h1>{translate("Users")}</h1>
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
