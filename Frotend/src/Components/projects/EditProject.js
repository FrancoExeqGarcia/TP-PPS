import React, { useState } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../data/axiosConfig";
import { Form, Button, Container } from "react-bootstrap";
import useTranslation from "../../custom/useTranslation/useTranslation";


const EditProject = ({
  projects,
  selectedProject,
  setProjects,
  setIsEditing,
}) => {
  const id = selectedProject.id;

  const [name, setName] = useState(selectedProject.name);
  const [description, setDescription] = useState(selectedProject.description);
  const [startDate, setStartDate] = useState(selectedProject.startDate);
  const [endDate, setEndDate] = useState(selectedProject.endDate);
  const [status, setStatus] = useState(selectedProject.status);
  const translate = useTranslation();

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!name || !description || !startDate || !endDate) {
      return Swal.fire({
        icon: "error",
        title: "Error!",
        text: "All fields are required.",
        showConfirmButton: true,
      });
    }

    const updatedProject = {
      id,
      name,
      description,
      startDate,
      endDate,
      status,
    };

    try {
      const response = await axiosInstance.put(
        `/project/${id}`,
        updatedProject
      );
      setProjects(
        projects.map((project) => (project.id === id ? response.data : project))
      );
      setIsEditing(false);

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: `${name} project has been updated.`,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error updating project:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Something went wrong while updating the project.",
        showConfirmButton: true,
      });
    }
  };

  return (
    <Container className="small-container">
      <Form onSubmit={handleUpdate}>
        <h1>{translate("Edit Project")}</h1>
        <Form.Group controlId="name">
          <Form.Label>{translate("Name")}</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="description">
          <Form.Label>{translate("Description")}</Form.Label>
          <Form.Control
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
        <Form.Group controlId="status">
          <Form.Check
            type="checkbox"
            label="Status"
            checked={status}
            onChange={(e) => setStatus(e.target.checked)}
          />
        </Form.Group>
        <div className="mt-3">
          <Button type="submit" className="me-2">
            {translate("Update")}
          </Button>
          <Button variant="secondary" onClick={() => setIsEditing(false)}>
           {translate("Cancel")}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default EditProject;
