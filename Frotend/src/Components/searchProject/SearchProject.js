import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Card, Form } from "react-bootstrap";
import axiosInstance from "../../data/axiosConfig";
import Swal from "sweetalert2";
import { ThemeContext } from "../../services/themeContext/theme.context";
import ProjectCard from "../dashboard/ProjectCard";
import ToDoCard from "../dashboard/ToDoCard";
import NavBar from "../navBar/NavBar";

function SearchProject() {
  const [projects, setProjects] = useState([]);
  const [originalProjects, setOriginalProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [todos, setTodos] = useState([]);
  const [allTodos, setAllTodos] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axiosInstance.get("/project");
        setProjects(response.data);
        setOriginalProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong while fetching the projects!",
        });
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/user");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong while fetching the users!",
        });
      }
    };

    const fetchTodos = async () => {
      try {
        const response = await axiosInstance.get("/todo/all");
        setAllTodos(response.data);
        setTodos(response.data);
      } catch (error) {
        console.error("Error fetching todos:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong while fetching the todos!",
        });
      }
    };

    fetchProjects();
    fetchUsers();
    fetchTodos();
  }, []);

  const handleProjectClick = async (project) => {
    setSelectedProject(project);
    try {
      const response = await axiosInstance.get(`/todo?projectId=${project.id}`);
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong while fetching the todos!",
      });
    }
  };

  const handleUserChange = (e) => {
    const userId = e.target.value;
    setSelectedUserId(userId);
    if (userId) {
      const userTodos = allTodos.filter(
        (todo) => todo.assignedUserId == userId
      );
      if (userTodos.length > 0) {
        const projectIds = [
          ...new Set(userTodos.map((todo) => todo.projectID)),
        ];
        const foundProjects = originalProjects.filter((project) =>
          projectIds.includes(project.id)
        );
        setProjects(foundProjects);
        setSelectedProject(null);
        setTodos(userTodos);
      } else {
        Swal.fire({
          icon: "info",
          title: "No results",
          text: "No ToDos found for the selected user.",
        });
        setProjects([]);
        setSelectedProject(null);
        setTodos([]);
      }
    } else {
      setProjects(originalProjects);
      setSelectedProject(null);
      setTodos(allTodos);
    }
  };

  return (
    <div className="container-fluid">
      <NavBar />
      <div className="container-lg p-4">
        <h2>Buscar tareas por usuarios</h2>
        <Form className="mb-4">
          <Form.Group controlId="assignedUserId">
            <Form.Label>Search ToDos by Assigned User</Form.Label>
            <Form.Control
              as="select"
              value={selectedUserId}
              onChange={handleUserChange}
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Form>
        <h3>Proyectos</h3>
        <Row className="mt-4">
          {projects.length > 0 ? (
            projects.map((project) => (
              <Col key={project.id} xs={12} sm={6} md={4} lg={3}>
                <ProjectCard
                  project={project}
                  onProjectClick={() => handleProjectClick(project)}
                  isSelected={
                    selectedProject && selectedProject.id === project.id
                  }
                />
              </Col>
            ))
          ) : (
            <Col>
              <Card>
                <Card.Body>No projects found</Card.Body>
              </Card>
            </Col>
          )}
        </Row>
        <h3>Tareas</h3>
        <Row className="mt-4">
          {todos.length > 0 ? (
            todos.map((todo) => (
              <Col key={todo.id} xs={12} sm={6} md={4}>
                <ToDoCard todo={todo} />
              </Col>
            ))
          ) : (
            <Col>
              <Card>
                <Card.Body>No todos found</Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
}

export default SearchProject;
