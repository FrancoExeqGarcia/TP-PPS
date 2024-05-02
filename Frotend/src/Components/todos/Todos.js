import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import TodoForm from "../todoForm/TodoForm";
import TodoCard from "../todoCard/TodoCard";
import EditTodo from "../editTodo/EditTodo";
import useTranslation from "../../custom/useTranslation/useTranslation";
import "../../App.css";

function Todos({ projectId }) {
  const translate = useTranslation();

  const [tasks, setTasksState] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [userID, setUserID] = useState("");
  // const [projectId, setProjectId] = useState("");
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [userRole, setUserRole] = useState("");

  const setTasks = (newTasks) => {
    setTasksState(newTasks);
    saveTasksToLocalStorage(newTasks);
  };

  const saveTasksToLocalStorage = (tasks) => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  };

  // useEffect(() => {
  //   const storedTasks = localStorage.getItem("tasks");
  //   if (storedTasks) {
  //     setTasks(JSON.parse(storedTasks));
  //   }
  //   const storedUserID = Number(localStorage.getItem("userID"));
  //   if (storedUserID) {
  //     setUserID(storedUserID);
  //   }
  //   const storedUserRole = localStorage.getItem("userRole");
  //   if (storedUserRole) {
  //     setUserRole(storedUserRole);
  //   }
  //   // const storedProjectId = Number(localStorage.getItem("projectId"));
  //   // if (storedProjectId) {
  //   //   setProjectId(storedProjectId);
  //   // }
  // }, []);

  const filterTasksByProject = () => {
    const storedProjectId = Number(localStorage.getItem("projectId"));
    if (storedProjectId) {
      const newFilteredTasks = tasks
        .filter((task) => task.projectId === storedProjectId)
        .filter((task) => task.userID === userID);
      setFilteredTasks(newFilteredTasks);
    } else {
      setFilteredTasks(tasks);
    }
  };
  useEffect(() => {
    filterTasksByProject();
  }, [tasks, userID, projectId]);

  const handleFilterButtonClick = () => {
    filterTasksByProject();
  };
  const addTask = (newTask) => {
    setTasks([...tasks, newTask]);
  };

  const deleteTask = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    setTasks(updatedTasks);
  };

  const markTaskAsCompleted = (task) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === task.id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const deleteCompletedTasks = () => {
    const incompleteTasks = tasks.filter((task) => !task.completed);
    setTasks(incompleteTasks);
  };

  const editTask = (task) => {
    if (!task.completed) {
      setEditingTask(task);
    }
  };

  const saveEditedTask = (editedTask) => {
    const updatedTasks = tasks.map((task) =>
      task.id === editedTask.id ? editedTask : task
    );
    setTasks(updatedTasks);
    setEditingTask(null);
  };

  const cancelEdit = () => {
    setEditingTask(null);
  };

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-4 ">{translate("list_of_todos")}</h1>
      <Button onClick={handleFilterButtonClick}>
        {translate("filter_by_project")}
      </Button>

      <TodoForm
        onAddTask={addTask}
        onDeleteCompletedTask={deleteCompletedTasks}
      />
      <Row className="mt-4">
        {filteredTasks.map((task, index) => (
          <Col key={index} xs={12} md={6} lg={4} className="mb-3">
            {editingTask === task ? (
              <EditTodo
                task={task}
                onUpdateTask={saveEditedTask}
                onCancel={cancelEdit}
              />
            ) : (
              <TodoCard
                task={task}
                onDeleteTask={() => deleteTask(index)}
                onEditTask={editTask}
                onMarkAsCompleted={markTaskAsCompleted}
              />
            )}
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Todos;
