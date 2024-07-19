import React, { useState, useEffect, useTransition } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import axiosInstance from "../../data/axiosConfig";
import Swal from "sweetalert2";
import { useAuth } from "../../services/authenticationContext/authentication.context";
import ToDoCard from "../dashboard/ToDoCard";
import { useNavigate } from "react-router";
import useTranslation from "../../custom/useTranslation/useTranslation";

function SearchTodos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [incompleteTodos, setIncompleteTodos] = useState([]);

  const translate = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTodos = async () => {
      if (!user || !user.UserId) {
        console.error("User or User ID is not defined");
        return;
      }

      try {
        console.log("Fetching todos for user ID:", user.UserId); // Log para verificar el ID del usuario
        const response = await axiosInstance.get("/todo/all");
        console.log("Response data:", response.data); // Log de los datos obtenidos

        const userTodos = response.data.filter(
          (todo) => String(todo.assignedUserId) === String(user.UserId)
        );
        console.log("Filtered todos:", userTodos); // Log de las tareas filtradas

        setTodos(userTodos);
        setIncompleteTodos(userTodos.filter((todo) => !todo.isCompleted));
      } catch (error) {
        console.error("Error fetching todos:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong while fetching the todos!",
        });
      }
    };

    fetchTodos();
  }, [user.UserId]);

  const handleBackToHome = () => {
    navigate("/home");
  };

  return (
    <Container>
      <h2 className="mt-4">Mis Tareas</h2>
      <h3>Todas las Tareas</h3>
      <Row className="mt-4">
        {todos.length > 0 ? (
          todos.map((todo) => (
            <Col key={todo.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <ToDoCard todo={todo} />
            </Col>
          ))
        ) : (
          <Col>
            <Card>
              <Card.Body>No todos assigned to you.</Card.Body>
            </Card>
          </Col>
        )}
      </Row>
      <h3>Tareas Incompletas</h3>
      <Row className="mt-4">
        {incompleteTodos.length > 0 ? (
          incompleteTodos.map((todo) => (
            <Col key={todo.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <ToDoCard todo={todo} />
            </Col>
          ))
        ) : (
          <Col>
            <Card>
              <Card.Body>No incomplete todos assigned to you.</Card.Body>
            </Card>
          </Col>
        )}
      </Row>
      <Button variant="primary" onClick={handleBackToHome} className="mt-3">
        {translate("Back to Home")}
      </Button>
    </Container>
  );
}

export default SearchTodos;
