import React, { useState, useContext, useEffect } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../data/axiosConfig";
import { Form, Button, Container } from "react-bootstrap";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { ThemeContext } from "../../services/themeContext/theme.context";

// Enum para los estados del proyecto
const ProjectStates = {
  0: "Not Started",
  1: "In Progress",
  2: "Done",
};

const EditProject = ({
  projects,
  selectedProject,
  setProjects,
  setIsEditing,
}) => {
  const [id, setId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [state, setState] = useState(false);
  const [projectState, setProjectState] = useState(0);
  const translate = useTranslation();
  const { theme } = useContext(ThemeContext);
  const className = `h1 ${theme === "oscuro" ? "dark-theme" : "light-theme"}`;

  useEffect(() => {
    if (selectedProject) {
      setId(selectedProject.id);
      setName(selectedProject.name);
      setDescription(selectedProject.description);
      setStartDate(selectedProject.startDate);
      setEndDate(selectedProject.endDate);
      setState(selectedProject.state);
      setProjectState(selectedProject.projectState);
    }
  }, [selectedProject]);

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
      state,
      projectState,
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

  if (!selectedProject) {
    return <div>Loading...</div>;
  }

  return (
    <Container className="small-container">
      <Form onSubmit={handleUpdate}>
        <h1 className={className}>{translate("Edit Project")}</h1>
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
        <Form.Group controlId="state">
          <Form.Check
            type="checkbox"
            label={translate("State")}
            checked={state}
            onChange={(e) => setState(e.target.checked)}
          />
        </Form.Group>
        <Form.Group controlId="projectState">
          <Form.Label>{translate("Project State")}</Form.Label>
          <Form.Control
            as="select"
            value={projectState}
            onChange={(e) => setProjectState(Number(e.target.value))}
          >
            {Object.entries(ProjectStates).map(([key, value]) => (
              <option key={key} value={key}>
                {translate(value)}
              </option>
            ))}
          </Form.Control>
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
