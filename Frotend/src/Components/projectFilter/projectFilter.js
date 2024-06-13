import React, { useState, useEffect } from "react";
import { Form, Container, Row, Col, Alert } from "react-bootstrap";
import { useAuth } from "../services/authenticationContext/authentication.context";
import ProjectCard from "../projectCard/ProjectCard";
import TodoCard from "../todoCard/TodoCard";
import useTranslation from "../../custom/useTranslation/useTranslation";

const ProjectFilter = () => {
  const translate = useTranslation();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("https://localhost:7166/api/Project", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("Error fetching projects.");
      setProjects([]);
    }
  };

  const fetchProjectWithTodos = async (projectId) => {
    try {
      const response = await fetch(
        `https://localhost:7166/api/Project/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      const data = await response.json();
      console.log(data);
      setSelectedProject(data);
      setTodos(data.toDos || []);
    } catch (error) {
      console.error("Error fetching project with todos:", error);
      setError("Error fetching project with todos.");
      setTodos([]);
    }
  };

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    fetchProjectWithTodos(projectId);
  };

  return (
    <Container>
      {error && (
        <Alert variant="danger" className="mt-4">
          {error}
        </Alert>
      )}
      <Row className="mt-4">
        <Col>
          <Form.Group controlId="formProject">
            <Form.Label>{translate("select_project")}</Form.Label>
            <Form.Control as="select" onChange={handleProjectChange}>
              <option value="">{translate("select_one_project")}</option>
              {projects.map((project) => (
                <option key={project.projectId} value={project.projectId}>
                  {project.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>
      {selectedProject && (
        <Row className="mt-4">
          <Col>
            <h3>{translate("project_details")}</h3>
            <ProjectCard project={selectedProject} />
          </Col>
        </Row>
      )}
      {todos.length > 0 && (
        <Row className="mt-4">
          <Col>
            <h3>{translate("todos")}</h3>
            {todos.map((todo) => (
              <TodoCard key={todo.toDoId} task={todo} />
            ))}
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ProjectFilter;
