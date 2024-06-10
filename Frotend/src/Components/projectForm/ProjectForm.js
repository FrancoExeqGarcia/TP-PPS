import React, { useState, useEffect, useContext } from "react";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { Form, Button, Col, Row, Alert, Container } from "react-bootstrap";
import { ThemeContext } from "../services/themeContext/theme.context";
import "../../App.css";
import axios from "axios";
import { useAuth } from "../services/authenticationContext/authentication.context";

function ProjectForm({
  onAddProject,
  onDeleteCompletedProject,
  editedProject,
}) {
  const { theme } = useContext(ThemeContext);
  const { user } = useAuth();
  const translate = useTranslation();
  const [projectName, setProjectName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [userID, setUserID] = useState(0);
  const [adminUsers, setAdminUsers] = useState([]);

  useEffect(() => {
    setProjectName(editedProject ? editedProject.name : "");
    setStartDate(editedProject ? editedProject.startDate : "");
    setEndDate(editedProject ? editedProject.endDate : "");
    setUserID(editedProject ? editedProject.userID : 0);
  }, [editedProject]);

  useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        const response = await axios.get(
          "https://localhost:7166/api/User/admins",
          {
            headers: {
              Authorization: `Bearer ${user.token}`, 
            },
          }
        );
        setAdminUsers(response.data);
      } catch (error) {
        console.error("Error fetching admin users:", error);
      }
    };
    fetchAdminUsers();
  }, [user.token]);
  const handleSubmit = (e) => {
    e.preventDefault();

    if (projectName.trim() === "") {
      setErrorMessage("Por favor, ingresa el nombre del Proyecto.");
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
    if (!userID) {
      setErrorMessage("Por favor, ingresa el user ID asociado.");
      return;
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (endDateObj < startDateObj) {
      setErrorMessage(
        "La fecha de fin no puede ser anterior a la fecha de inicio."
      );
      return;
    }

    const newProject = {
      name: projectName,
      startDate,
      endDate,
      userID,
    };

    if (editedProject) {
      onAddProject({ ...editedProject, ...newProject });
    } else {
      const projectWithId = { ...newProject, id: Date.now() };
      onAddProject(projectWithId);
    }

    setProjectName("");
    setStartDate("");
    setEndDate("");
    setErrorMessage("");
  };

  return (
    <Container className={`mt-100 form-container ${theme === "DARK" && "dark-theme"} `}
    >
      <h1 className="text-center mb-4">{translate("add_project")}</h1>
      <Form onSubmit={handleSubmit} className="mt-1 shadow p-5 border-gray">
        <Form.Group as={Row}>
          <Form.Label column sm={4} className="text-right">
            {translate("name_project")}
          </Form.Label>
          <Col sm={8}>
            <Form.Control
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
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
        <Form.Group as={Row}>
          <Form.Label column sm={4} className="text-right">
            {translate("user_id")}
          </Form.Label>
          <Col sm={8}>
            <Form.Select
              value={userID}
              onChange={(e) => setUserID(e.target.value)}
            >
              {adminUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Form.Group>
        <Form.Group as={Row}>
          <Col sm={{ span: 8, offset: 4 }}>
            <Button variant="primary" type="submit" className="mt-3">
              {translate("add_project")}
            </Button>
            <Button
              variant="outline-danger"
              className="mt-3"
              onClick={onDeleteCompletedProject}
              type="submit"
            >
              {translate("delete_completed")}
            </Button>
          </Col>
        </Form.Group>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      </Form>
    </Container>
  );
}

export default ProjectForm;
