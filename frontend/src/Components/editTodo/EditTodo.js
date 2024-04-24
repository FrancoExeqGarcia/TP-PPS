import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import useTranslation from "../../custom/useTranslation/useTranslation";

function EditTodo({ task, onUpdateTask, onCancel }) {
  const translate = useTranslation();
  const [editedName, setEditedName] = useState(task.name);
  const [editedStartDate, setEditedStartDate] = useState(task.startDate);
  const [editedEndDate, setEditedEndDate] = useState(task.endDate);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSaveChanges = (e) => {
    e.preventDefault();

    // Validar que el nombre no esté vacío antes de guardar los cambios
    if (editedName.trim() === "") {
      setErrorMessage("El nombre de la tarea no puede estar vacío.");
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

    const updatedTask = {
      ...task,
      name: editedName,
      startDate: editedStartDate,
      endDate: editedEndDate,
    };

    // Llama a la función onUpdateTask pasando la tarea actualizada
    onUpdateTask(updatedTask);

    // Llama a la función onCancel para salir del modo de edición
    onCancel();
  };

  return (
    <Form onSubmit={handleSaveChanges}>
      <Form.Group>
        <Form.Label>{translate("name_task")}</Form.Label>
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

export default EditTodo;
