import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import useTranslation from "../../custom/useTranslation/useTranslation";

function EditProject({ project, onUpdateProject, onCancel }) {
  const translate = useTranslation();
  const [editedName, setEditedName] = useState(project.name);
  const [editedStartDate, setEditedStartDate] = useState(project.startDate);
  const [editedEndDate, setEditedEndDate] = useState(project.endDate);
  const [editedUserID, setEditedUserID] = useState(project.userID);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSaveChanges = (e) => {
    e.preventDefault();

    // Validar que el nombre no esté vacío antes de guardar los cambios
    if (editedName.trim() === "") {
      setErrorMessage("El nombre del proyecto no puede estar vacío.");
      return;
    }
    if (!editedStartDate) {
      setErrorMessage("Por favor, ingresa la fecha de inicio.");
      return;
    }

    if (!editedEndDate) {
      setErrorMessage("Por favor, ingresa la fecha de fin.");
      return;
    }
    if (!editedUserID) {
      setErrorMessage("Por favor, ingresa el user ID asociado.");
      return;
    }

    const updatedProject = {
      ...project,
      name: editedName,
      startDate: editedStartDate,
      endDate: editedEndDate,
      userID:editedUserID,
    };

    // Llama a la función onUpdateProject pasando el proyecto actualizado
    onUpdateProject(updatedProject);

    // Llama a la función onCancel para salir del modo de edición
    onCancel();
  };

  return (
    <Form onSubmit={handleSaveChanges}>
      <Form.Group>
        <Form.Label>{translate("name_project")}</Form.Label>
        <Form.Control
          type="text"
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>{translate("start_date")}</Form.Label>
        <Form.Control
          type="date"
          value={editedStartDate}
          onChange={(e) => setEditedStartDate(e.target.value)}
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>{translate("end_date")}</Form.Label>
        <Form.Control
          type="date"
          value={editedEndDate}
          onChange={(e) => setEditedEndDate(e.target.value)}
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>{translate("user_id")}</Form.Label>
        <Form.Control
          type="number"
          value={editedUserID}
          onChange={(e) => setEditedUserID(Number(e.target.value))}
        />
      </Form.Group>
      <Button variant="primary" type="submit">
        {translate("save_changes")}
      </Button>
      <Button variant="secondary" onClick={onCancel}>
        {translate("cancel")}
      </Button>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
    </Form>
  );
}

export default EditProject;
