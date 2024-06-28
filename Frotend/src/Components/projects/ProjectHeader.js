import React from "react";

const ProjectHeader = ({ setIsAdding, setIsAuthenticated }) => {
  return (
    <header>
      <h1>Projects</h1>
      <div style={{ marginTop: "30px", marginBottom: "18px" }}>
        <button 
          onClick={() => setIsAdding(true)} 
          className="btn btn-primary"
        >
          Add Project
        </button>
      </div>
    </header>
  );
};

export default ProjectHeader;
