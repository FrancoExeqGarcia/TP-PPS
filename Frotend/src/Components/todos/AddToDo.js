import React, { useState } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../data/axiosConfig";
import { Form, Button, Container } from "react-bootstrap";

const AddToDo = ({ todos, setTodos, setIsAdding, users, projectId }) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [state, setState] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [assignedUserId, setAssignedUserId] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!name || !startDate || !endDate) {
      return Swal.fire({
        icon: "error",
        title: "Error!",
        text: "All fields are required.",
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
        title: "Added!",
        text: `${name} todo has been added.`,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error adding todo:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Something went wrong while adding the todo.",
        showConfirmButton: true,
      });
    }
  };

  return (
    <Container className="small-container">
      <Form onSubmit={handleAdd}>
        <h1>Add ToDo</h1>
        <Form.Group controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="startDate">
          <Form.Label>Start Date</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="endDate">
          <Form.Label>End Date</Form.Label>
          <Form.Control
            type="date"
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
          <Form.Label>Assigned User</Form.Label>
          <Form.Control
            as="select"
            value={assignedUserId}
            onChange={(e) => setAssignedUserId(e.target.value)}
          >
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <div className="mt-3">
          <Button type="submit" className="me-2">
            Add
          </Button>
          <Button variant="secondary" onClick={() => setIsAdding(false)}>
            Cancel
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default AddToDo;
