import React from 'react';
import ProjectCard from './ProjectCard';

const ProjectCards = ({ projects, onProjectClick }) => {
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
        <p>No Projects</p>
      )}
    </div>
  );
};

export default ProjectCards;