import React from "react";
import useTranslation from "../../custom/useTranslation/useTranslation";

const ToDoHeader = ({ setIsAdding, setSelectedProjectId }) => {
  const translate = useTranslation();

  return (
    <header>
      <h1>{translate("Todo List")}</h1>
      <div style={{ marginTop: "30px", marginBottom: "18px" }}>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          {translate("Add ToDo")}
        </button>
      </div>
    </header>
  );
};

export default ToDoHeader;
