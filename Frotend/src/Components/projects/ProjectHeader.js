import React from "react";
import useTranslation from "../../custom/useTranslation/useTranslation";

const ProjectHeader = ({ setIsAdding, setIsAuthenticated }) => {
  const translate = useTranslation();
  return (
    <header>
      <h1>{translate("Projects")}</h1>
      <div style={{ marginTop: "30px", marginBottom: "18px" }}>
        <button onClick={() => setIsAdding(true)} className="btn btn-primary">
          {translate("Add Project")}
        </button>
      </div>
    </header>
  );
};

export default ProjectHeader;
