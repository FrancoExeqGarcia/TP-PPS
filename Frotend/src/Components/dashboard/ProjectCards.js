import React from "react";
import ProjectCard from "./ProjectCard";
import useTranslation from "../../custom/useTranslation/useTranslation";

const ProjectCards = ({ projects, onProjectClick }) => {
  const translate = useTranslation();

  return (
    <Row className="cards-container">
      {projects.length > 0 ? (
        projects.map((project) => (
          <Col key={project.id} xs={12} sm={6} md={4} lg={3}>
            <ProjectCard
              project={project}
              onProjectClick={handleProjectClick}
              isSelected={project.id === selectedProjectId}
            />
          </Col>
        ))
      ) : (
        <Col>
          <p>No Projects</p>
        </Col>
      )}
    </Row>
  );
};

export default ProjectCards;
