import React, { useState, useEffect, useContext } from "react";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { Form, Button, Col, Row, Alert } from "react-bootstrap";
import { ThemeContext } from "../services/themeContext/theme.context";
import '../../App.css';
import { useAuth } from "../services/authenticationContext/authentication.context";

function TodoForm({ onAddTask, onDeleteCompletedTask, editedTask }) {
  const { theme } = useContext(ThemeContext);
  const translate = useTranslation();
  const [taskName, setTaskName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [userID, setUserID] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    setTaskName(editedTask ? editedTask.name : "");
    setStartDate(editedTask ? editedTask.startDate : "");
    setEndDate(editedTask ? editedTask.endDate : "");
    setUserID(editedTask ? editedTask.userID : 0);
  }, [editedTask]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (taskName.trim() === "") {
      setErrorMessage("Por favor, ingresa el nombre de la tarea.");
      return;
    }

    if (!startDate) {
      setErrorMessage("Por favor, ingresa la fecha de inicio.");
      return;
    }

    if (!endDate) {
      setErrorMessage("Por favor, ingresa la fecha de fin.");
      return;
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (endDateObj < startDateObj) {
      setErrorMessage("La fecha de fin no puede ser anterior a la fecha de inicio.");
      return;
    }

    const newTask = {
      name: taskName,
      startDate,
      endDate,
      completed: false,
      userID: (user.UserType === "SuperAdmin" || user.UserType === "Admin") ? userID : JSON.parse(localStorage.getItem("userID")),
      projectId: JSON.parse(localStorage.getItem("projectId")),
    };

    if (editedTask) {
      onAddTask({ ...editedTask, ...newTask });
    } else {
      const taskWithId = { ...newTask, id: Date.now() };
      onAddTask(taskWithId);
    }

    setTaskName("");
    setStartDate("");
    setEndDate("");
    setUserID(0);
    setErrorMessage("");
  };

  return (
    <Form onSubmit={handleSubmit} className={`mt-1 shadow p-5 ${theme === "DARK" && "dark-theme"} border-gray`}>
      <Form.Group as={Row}>
        <Form.Label column sm={4} className="text-right">
          {translate("name_task")}
        </Form.Label>
        <Col sm={8}>
          <Form.Control
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row}>
        <Form.Label column sm={4} className="text-right">
          {translate("start_date")}
        </Form.Label>
        <Col sm={8}>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row}>
        <Form.Label column sm={4} className="text-right">
          {translate("end_date")}
        </Form.Label>
        <Col sm={8}>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Col>
      </Form.Group>
      {(user.UserType === "SuperAdmin" || user.UserType === "Admin") && (
        <Form.Group as={Row}>
          <Form.Label column sm={4} className="text-right">
            {translate("user_id")}
          </Form.Label>
          <Col sm={8}>
            <Form.Control
              type="number"
              value={userID}
              onChange={(e) => setUserID(Number(e.target.value))}
            />
          </Col>
        </Form.Group>
      )}
      <Form.Group as={Row}>
        <Col sm={{ span: 8, offset: 4 }}>
          <Button variant="primary" type="submit" className="mt-3">
            {translate("add_task")}
          </Button>
          <Button
            variant="outline-danger"
            className="mt-3"
            onClick={onDeleteCompletedTask}
            type="button"
          >
            {translate("delete_completed")}
          </Button>
        </Col>
      </Form.Group>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
    </Form>
  );
}

export default TodoForm;
