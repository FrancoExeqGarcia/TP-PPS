import React, { useState, useContext } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../data/axiosConfig";
import { Form, Button, Container } from "react-bootstrap";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { ThemeContext } from "../../services/themeContext/theme.context";

const AddToDo = ({
  todos,
  setTodos,
  setIsAdding,
  users,
  projectId,
  projects, 
}) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [state, setState] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [assignedUserId, setAssignedUserId] = useState("");
  const translate = useTranslation();
  const { theme } = useContext(ThemeContext);
  const className = `h1 ${theme === "oscuro" ? "dark-theme" : "light-theme"}`;

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!name || !startDate || !endDate) {
      return Swal.fire({
        icon: "error",
        title: translate("sw_error_title"),
        text: translate("sw_all_fields_required_text"),
        showConfirmButton: true,
      });
    }
    if (new Date(startDate) > new Date(endDate)) {
      return Swal.fire({
        icon: "error",
        title: translate("sw_error_title"),
        text: translate("sw_error_date"),
        showConfirmButton: true,
      });
    }
    if (!projects) {
      return Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Projects data is not available.",
        showConfirmButton: true,
      });
    }
    const project = projects.find((p) => p.id === projectId);
    if (!project) {
      return Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Project not found.",
        showConfirmButton: true,
      });
    }

    if (
      new Date(startDate) < new Date(project.startDate) ||
      new Date(endDate) > new Date(project.endDate)
    ) {
      return Swal.fire({
        icon: "error",
        title: "Error!",
        text: "The task dates must be within the project period.",
        showConfirmButton: true,
      });
    }

    const newToDo = {
      name,
      startDate,
      endDate,
      projectId,
      state,
      isCompleted,
      assignedUserId: assignedUserId || null,
    };

    try {
      const response = await axiosInstance.post("/todo", newToDo);
      setTodos([...todos, response.data]);
      setIsAdding(false);

      Swal.fire({
        icon: "success",
        title: translate("sw_todo_added_title"),
        text: translate("sw_todo_added_text").replace("{name}", name),
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error adding todo:", error);
      Swal.fire({
        icon: "error",
        title: translate("sw_todo_add_error_title"),
        text: translate("sw_todo_add_error_text"),
        showConfirmButton: true,
      });
    }
  };

  return (
    <Container className="small-container">
      <Form onSubmit={handleAdd}>
        <h1 className={className}>{translate("Add ToDo")}</h1>
        <Form.Group controlId="name">
          <Form.Label>{translate("Name")}</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="startDate">
          <Form.Label>{translate("Start Date")}</Form.Label>
          <Form.Control
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="endDate">
          <Form.Label>{translate("End Date")}</Form.Label>
          <Form.Control
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="state">
          <Form.Check
            type="checkbox"
            label="State"
            checked={state}
            onChange={(e) => setState(e.target.checked)}
          />
        </Form.Group>
        <Form.Group controlId="isCompleted">
          <Form.Check
            type="checkbox"
            label="Is Completed"
            checked={isCompleted}
            onChange={(e) => setIsCompleted(e.target.checked)}
          />
        </Form.Group>
        <Form.Group controlId="assignedUserId">
          <Form.Label>{translate("Assigned User")}</Form.Label>
          <Form.Control
            as="select"
            value={assignedUserId}
            onChange={(e) => setAssignedUserId(e.target.value)}
          >
            <option value="">{translate("Select User")}</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <div className="mt-3">
          <Button type="submit" className="me-2">
            {translate("agregar")}
          </Button>
          <Button variant="secondary" onClick={() => setIsAdding(false)}>
            {translate("cancel")}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default AddToDo;
