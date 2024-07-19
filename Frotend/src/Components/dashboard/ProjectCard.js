import React from "react";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { Card } from "react-bootstrap";

// Enum para los estados del proyecto
const ProjectStates = {
  0: "Not Started",
  1: "In Progress",
  2: "Done",
};

// Función para obtener el estilo basado en el estado del proyecto
const getProjectCardStyle = (state) => {
  switch (state) {
    case 0:
      return {
        backgroundColor: "#f8f9fa",
        borderColor: "#6c757d",
        color: "#6c757d",
      }; // Gris
    case 1:
      return {
        backgroundColor: "#d6eaf8",
        borderColor: "#3498db",
        color: "#3498db",
      }; // Azul
    case 2:
      return {
        backgroundColor: "#d4edda",
        borderColor: "#28a745",
        color: "#28a745",
      }; // Verde
    default:
      return {
        backgroundColor: "#ffffff",
        borderColor: "#000000",
        color: "#000000",
      }; // Por defecto
  }
};

const ProjectCard = ({ project, onProjectClick, isSelected }) => {
  const translate = useTranslation();
  const projectCardStyle = getProjectCardStyle(project.projectState);

  const handleCardClick = () => {
    onProjectClick(project.id);
  };

  return (
    <Card
      style={{
        width: "18rem",
        cursor: "pointer",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        border: isSelected
          ? `2px solid ${projectCardStyle.borderColor}`
          : `1px solid ${projectCardStyle.borderColor}`,
        borderRadius: "0.25rem",
        backgroundColor: projectCardStyle.backgroundColor,
        color: projectCardStyle.color,
        transition: "border-color 0.3s ease",
      }}
      className={`project-card ${isSelected ? "selected" : ""}`}
      onClick={handleCardClick}
    >
      <Card.Body>
        <Card.Title style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
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
        <Card.Text>
          <strong>{translate("Project State")}:</strong>{" "}
          {ProjectStates[project.projectState] || "Unknown"}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ProjectCard;
