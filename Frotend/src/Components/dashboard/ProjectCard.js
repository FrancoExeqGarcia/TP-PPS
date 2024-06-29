import React from 'react';
import useTranslation from "../../custom/useTranslation/useTranslation";

const ProjectCard = ({ project, onProjectClick }) => {
  const translate = useTranslation();
  
  const handleCardClick = () => {
    onProjectClick(project);
  };

  return (
    <div className="card" onClick={handleCardClick}>
      <h2>{project.name}</h2>
      <p>{project.description}</p>
      <p>{translate("Start Date")}: {project.startDate}</p>
      <p>{translate("End Date")}: {project.endDate}</p>
      <p>{translate("Status")}: {project.status ? 'Active' : 'Inactive'}</p>
    </div>
  );
};

export default ProjectCard;