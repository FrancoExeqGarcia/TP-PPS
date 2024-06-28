import React from 'react';

const ProjectCard = ({ project, onProjectClick }) => {
  const handleCardClick = () => {
    onProjectClick(project);
  };

  return (
    <div className="card" onClick={handleCardClick}>
      <h2>{project.name}</h2>
      <p>{project.description}</p>
      <p>Start Date: {project.startDate}</p>
      <p>End Date: {project.endDate}</p>
      <p>Status: {project.status ? 'Active' : 'Inactive'}</p>
    </div>
  );
};

export default ProjectCard;