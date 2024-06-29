import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";
import ProjectCard from "./ProjectCard";
import useTranslation from "../../custom/useTranslation/useTranslation";

const ProjectCards = ({ projects, onProjectClick }) => {
  const translate = useTranslation();
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const handleProjectClick = (projectId) => {
    setSelectedProjectId(projectId);
    if (onProjectClick) {
      onProjectClick(projectId);
    }
  };

  return (
    <Row className="cards-container">
      {projects.length > 0 ? (
        projects.map((project) => (
          <Col key={project.id} xs={12} sm={6} md={4} lg={3}>
            <ProjectCard
              project={project}
              onProjectClick={() => handleProjectClick(project.id)}
              isSelected={project.id === selectedProjectId}
            />
          </Col>
        ))
      ) : (
        <Col>
          <p>{translate("No Projects")}</p>
        </Col>
      )}
    </Row>
  );
};

export default ProjectCards;
