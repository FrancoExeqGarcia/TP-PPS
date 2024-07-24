import React, { useState, useEffect, useContext } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../data/axiosConfig";
import ToDoHeader from "./ToDoHeader";
import ToDoTable from "./ToDoTable";
import AddToDo from "./AddToDo";
import EditToDo from "./EditToDo";
import { ThemeContext } from "../../services/themeContext/theme.context";
import useTranslation from "../../custom/useTranslation/useTranslation";

const ToDoDashboard = ({ projectId, setSelectedProjectId }) => {
  const { theme } = useContext(ThemeContext);
  const className = `project-dashboard ${
    theme === "oscuro" ? "dark-theme" : "light-theme"
  }`;

  const translate = useTranslation();

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
          title: translate("sw_fetch_todos_error_title"),
          text: translate("sw_fetch_todos_error_text"),
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
          title: translate("sw_fetch_users_error_title"),
          text: translate("sw_fetch_users_error_text"),
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
      title: translate("sw_warning_title"),
      text: translate("sw_warning_text"),
      showCancelButton: true,
      confirmButtonText: translate("sw_confirm_button_text"),
      cancelButtonText: translate("sw_cancel_button_text"),
    }).then(async (result) => {
      if (result.value) {
        try {
          await axiosInstance.delete(`/todo/${id}`);
          const todosCopy = todos.filter((todo) => todo.id !== id);
          setTodos(todosCopy);

          Swal.fire({
            icon: "success",
            title: translate("sw_success_title"),
            text: translate("sw_success_text_todo"),
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (error) {
          console.error("Error deleting todo:", error);
          Swal.fire({
            icon: "error",
            title: translate("sw_error_title"),
            text: translate("sw_delete_error_text"),
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
