import React from 'react';
import ProjectCard from './ProjectCard';
import useTranslation from "../../custom/useTranslation/useTranslation";

const ProjectCards = ({ projects, onProjectClick }) => {
  const translate = useTranslation();

  return (
    <div className="cards-container">
      {projects.length > 0 ? (
        projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onProjectClick={onProjectClick}
          />
        ))
      ) : (
        <p>{translate("No Projects")}</p>
      )}
    </div>
  );
};

export default ProjectCards;