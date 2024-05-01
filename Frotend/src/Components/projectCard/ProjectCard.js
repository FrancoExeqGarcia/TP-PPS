import React, { useState } from "react";
import { Card, Button, Form } from "react-bootstrap";
import useTranslation from "../../custom/useTranslation/useTranslation";

function ProjectCard({
  project,
  onDeleteProject,
  onEditProject,
  onMarkAsCompleted,
  onProjectClick,
}) {
  const translate = useTranslation();

  const handleEditClick = () => {
    if (!project.completed) {
      if (project.name.trim() === "") {
        alert("El nombre del Proyecto no puede estar vacío.");
        return;
      }

      onEditProject(project);
    }
  };

  const handleProjectClick = () => {
    localStorage.setItem("projectId", JSON.stringify(project.id));
  };

  return (
    <Card bg="info" key="info" text="light">
      <Card.Body>
        <Card.Title>{project.name}</Card.Title>
        <Card.Text>
          {translate("start_date")}:{" "}
          {new Date(project.startDate).toLocaleDateString()}
        </Card.Text>
        <Card.Text>
          {translate("end_date")}:{" "}
          {new Date(project.endDate).toLocaleDateString()}
        </Card.Text>
        <Card.Text>{translate("user_id")}: {project.userID}</Card.Text>
        <Form.Check
          type="checkbox"
          label={translate("completed")}
          onClick={() => onMarkAsCompleted(project)}
        />
        <Button
          variant="secondary"
          onClick={handleEditClick}
          disabled={project.completed}
        >
          {translate("edit")}
        </Button>
        <Button variant="danger" onClick={() => onDeleteProject(project)}>
          {translate("delete")}
        </Button>
        <Button variant="primary" onClick={handleProjectClick}>
          {translate("select_project")}
        </Button>
      </Card.Body>
    </Card>
  );
}

export default ProjectCard;
