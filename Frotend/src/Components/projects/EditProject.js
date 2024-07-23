import React, { useState, useContext, useEffect } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../data/axiosConfig";
import { Form, Button, Container } from "react-bootstrap";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { ThemeContext } from "../../services/themeContext/theme.context";

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

  const ProjectStates = {
    0: translate("not_started"),
    1: translate("in_progress"),
    2: translate("done"),
  };

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
        title: translate("sw_error_title"),
        text: translate("sw_fields_required"),
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
        title: translate("success"),
        text: `${name} ${translate("project_update")}`,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error updating project:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: translate("err_update_project"),
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
        <Form.Group controlId="projectState">
          <Form.Label>{translate("project_states")}</Form.Label>
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
            {translate("update")}
          </Button>
          <Button variant="secondary" onClick={() => setIsEditing(false)}>
            {translate("cancel")}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default EditProject;
