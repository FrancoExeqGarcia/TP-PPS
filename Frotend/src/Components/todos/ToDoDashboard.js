import React, { useState, useEffect, useContext } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../data/axiosConfig";
import { useAuth } from "../../services/authenticationContext/authentication.context";

import ToDoHeader from "./ToDoHeader";
import ToDoTable from "./ToDoTable";
import AddToDo from "./AddToDo";
import EditToDo from "./EditToDo";
import { ThemeContext } from "../../services/themeContext/theme.context";

const ToDoDashboard = ({ projectId, setSelectedProjectId }) => {
  const { theme } = useContext(ThemeContext);
  const className = `project-dashboard ${
    theme === "oscuro" ? "dark-theme" : "light-theme"
  }`;

  const [todos, setTodos] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedToDo, setSelectedToDo] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    // Fetch todos for the selected project
  
    const fetchToDos = async () => {
      try {
        const response = await axiosInstance.get(
          `/todo?projectId=${projectId}`
        );
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

    fetchToDos();
    fetchUsers();
  }, [projectId]);

  const handleEdit = (id) => {
    const [todo] = todos.filter((todo) => todo.id === id);

    setSelectedToDo(todo);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then(async (result) => {
      if (result.value) {
        try {
          await axiosInstance.delete(`/todo/${id}`);
          const todosCopy = todos.filter((todo) => todo.id !== id);
          setTodos(todosCopy);

          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: `ToDo has been deleted.`,
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (error) {
          console.error("Error deleting todo:", error);
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "Something went wrong while deleting the todo.",
            showConfirmButton: true,
          });
        }
      }
    });
  };

  return (
    <div className={className}>
      {!isAdding && !isEditing && (
        <>
          <ToDoHeader
            setIsAdding={setIsAdding}
            setSelectedProjectId={setSelectedProjectId}
          />
          <ToDoTable
            todos={todos}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            users={users}
          />
        </>
      )}
      {isAdding && (
        <AddToDo
          todos={todos}
          setTodos={setTodos}
          setIsAdding={setIsAdding}
          users={users}
          projectId={projectId}
        />
      )}
      {isEditing && (
        <EditToDo
          todos={todos}
          selectedToDo={selectedToDo}
          setTodos={setTodos}
          setIsEditing={setIsEditing}
          users={users}
        />
      )}
    </div>
  );
};

export default ToDoDashboard;
