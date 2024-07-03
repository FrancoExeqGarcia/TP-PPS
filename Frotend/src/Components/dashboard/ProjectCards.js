import React, { useContext,useState } from "react";
import { Row, Col } from "react-bootstrap";
import ProjectCard from "./ProjectCard";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { ThemeContext } from "../../services/themeContext/theme.context";

const ProjectCards = ({ projects, onProjectClick }) => {
  const translate = useTranslation();
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const { theme } = useContext(ThemeContext);

  const handleProjectClick = (projectId) => {
    setSelectedProjectId(projectId);
    if (onProjectClick) {
      onProjectClick(projectId);
    }
  };

  return (
    <Row className="cards-container" variant={theme === "oscuro" ? "dark" : "light"}>
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
