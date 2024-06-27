import React from "react";

const ToDoHeader = ({ setIsAdding, setSelectedProjectId }) => {
  return (
    <header>
      <h1>Todo List</h1>
      <div style={{ marginTop: "30px", marginBottom: "18px" }}>
        <button onClick={() => setIsAdding(true)}>Add ToDo</button>
        <button
          onClick={() => setSelectedProjectId(null)}
          style={{ marginLeft: "12px" }}
        >
          Back to Projects
        </button>
      </div>
    </header>
  );
};

export default ToDoHeader;
