import React from "react";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { Card } from "react-bootstrap";

const ProjectCard = ({ project, onProjectClick, isSelected }) => {
  const translate = useTranslation();

  const handleCardClick = () => {
    onProjectClick(project.id);
  };
  return (
    <Card
      style={{
        width: "18rem",
        cursor: "pointer",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        border: isSelected ? `2px solid #502689` : "1px solid #ccc",
        transition: "border-color 0.3s ease",
      }}
      className={`project-card ${isSelected ? "selected" : ""}`}
      onClick={handleCardClick}
    >
      <Card.Body>
        <Card.Title
          style={{ fontSize: "1.5rem", color: "#502689", fontWeight: "bold" }}
        >
          {project.name}
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          {project.description}
        </Card.Subtitle>
        <Card.Text>
          <strong>{translate("Start Date")}:</strong> {project.startDate}
        </Card.Text>
        <Card.Text>
          <strong>{translate("End Date")}:</strong> {project.endDate}
        </Card.Text>
        <Card.Text>
          <strong>{translate("Status")}:</strong>{" "}
          {project.state ? "Active" : "Inactive"}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ProjectCard;
