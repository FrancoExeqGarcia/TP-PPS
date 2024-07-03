import React, { useState,useContext  } from "react";
import Swal from "sweetalert2";
import { Container, Form, Button } from 'react-bootstrap';
import axiosInstance from "../../data/axiosConfig";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { ThemeContext } from "../../services/themeContext/theme.context";

const EditToDo = ({ todos, selectedToDo, setTodos, setIsEditing, users }) => {
  const id = selectedToDo.id;

  const [name, setName] = useState(selectedToDo.name);
  const [startDate, setStartDate] = useState(selectedToDo.startDate);
  const [endDate, setEndDate] = useState(selectedToDo.endDate);
  const [state, setState] = useState(selectedToDo.state);
  const [isCompleted, setIsCompleted] = useState(selectedToDo.isCompleted);
  const translate = useTranslation();
  const [assignedUserId, setAssignedUserId] = useState(
    selectedToDo.assignedUserId || ""
  );
  const { theme } = useContext(ThemeContext);
  const className = `h1 ${
    theme === "oscuro" ? "dark-theme" : "light-theme"
  }`;

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!name || !startDate || !endDate) {
      return Swal.fire({
        icon: "error",
        title: "Error!",
        text: "All fields are required.",
        showConfirmButton: true,
      });
    }

    const updatedToDo = {
      id,
      name,
      startDate,
      endDate,
      state,
      isCompleted,
      assignedUserId: assignedUserId || null,
    };

    try {
      const response = await axiosInstance.put(`/todo/${id}`, updatedToDo);
      setTodos(todos.map((todo) => (todo.id === id ? response.data : todo)));
      setIsEditing(false);

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: `${name} todo has been updated.`,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error updating todo:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Something went wrong while updating the todo.",
        showConfirmButton: true,
      });
    }
  };

  return (
    <Container>
    <Form onSubmit={handleUpdate}>
      <h1 className={className}>{translate("Edit ToDo")}</h1>
      
      <Form.Group className="mb-3" controlId="name">
        <Form.Label>{translate("Name")}</Form.Label>
        <Form.Control
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Form.Group>
      
      <Form.Group className="mb-3" controlId="startDate">
        <Form.Label>{translate("Start Date")}</Form.Label>
        <Form.Control
          type="datetime-local"
          name="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </Form.Group>
      
      <Form.Group className="mb-3" controlId="endDate">
        <Form.Label>{translate("End Date")}</Form.Label>
        <Form.Control
          type="datetime-local"
          name="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </Form.Group>
      
      <Form.Group className="mb-3" controlId="state">
        <Form.Check
          type="checkbox"
          name="state"
          checked={state}
          onChange={(e) => setState(e.target.checked)}
          label={translate("State")}
        />
      </Form.Group>
      
      <Form.Group className="mb-3" controlId="isCompleted">
        <Form.Check
          type="checkbox"
          name="isCompleted"
          checked={isCompleted}
          onChange={(e) => setIsCompleted(e.target.checked)}
          label={translate("Is Completed")}
        />
      </Form.Group>
      
      <Form.Group className="mb-3" controlId="assignedUserId">
        <Form.Label>{translate("Assigned User")}</Form.Label>
        <Form.Select
          name="assignedUserId"
          value={assignedUserId}
          onChange={(e) => setAssignedUserId(e.target.value)}
        >
          <option value="">{translate("Select User")}</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      
      <Button variant="primary" type="submit" className="me-2">
        {translate("Update")}
      </Button>
      <Button
        variant="secondary"
        onClick={() => setIsEditing(false)}
      >
        {translate("Cancel")}
      </Button>
    </Form>
  </Container>
);
};

export default EditToDo;
