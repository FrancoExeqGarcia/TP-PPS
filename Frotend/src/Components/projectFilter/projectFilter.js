import React, { useState, useEffect } from "react";
import { Form, Container, Row, Col, Alert, Button } from "react-bootstrap";
import { useAuth } from "../services/authenticationContext/authentication.context";
import ProjectCard from "../projectCard/ProjectCard";
import TodoCard from "../todoCard/TodoCard";
import useTranslation from "../../custom/useTranslation/useTranslation";

const ProjectFilter = () => {
  const translate = useTranslation();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [todos, setTodos] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [error, setError] = useState(null);
  const [showProjects, setShowProjects] = useState(false);
  const [showTodos, setShowTodos] = useState(false);

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
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("Error fetching projects.");
      setProjects([]);
    }
  };

  const fetchAllTodos = async () => {
    try {
      const response = await fetch("https://localhost:7166/getalltodos", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
      }
      const data = await response.json();
      setTodos(data);
      setSelectedProject(null);
      setShowProjects(false);
      setShowTodos(true);
    } catch (error) {
      console.error("Error fetching todos:", error.message);
      setError(`Error fetching todos: ${error.message}`);
      setTodos([]);
    }
  };

  const fetchAllProjects = async () => {
    try {
      const response = await fetch("https://localhost:7166/api/Project", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setProjects(data);
      setSelectedProject(null);
      setTodos([]);
      setShowProjects(true);
      setShowTodos(false);
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
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setSelectedProject(data);
      setTodos(data.toDos || []);
      setShowProjects(false);
      setShowTodos(false);
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
          <Button onClick={fetchAllTodos} className="me-2">
            {translate("all_todos")}
          </Button>
          <Button onClick={fetchAllProjects}>
            {translate("all_projects")}
          </Button>
        </Col>
      </Row>
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
      
      {showProjects && projects.length > 0 && (
        <Row className="mt-4">
          <Col>
            <h3>{translate("all_projects")}</h3>
            {projects.map((project) => (
              <div key={project.projectId}>
                <h4>{translate("projects")}</h4>
                <ProjectCard project={project} />
                <h4>{translate("tasks")}</h4>
                {project.toDos.map((todo) => (
                  <TodoCard key={todo.toDoId} task={todo} />
                ))}
              </div>
            ))}
          </Col>
        </Row>
      )}

      {showTodos && todos.length > 0 && (
        <Row className="mt-4">
          <Col>
            <h3>{translate("all_todos")}</h3>
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
