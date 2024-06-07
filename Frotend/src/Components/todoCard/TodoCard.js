import React, { useContext } from "react";
import { Card, Button, Form } from "react-bootstrap";
import { TranslateContext } from "../services/translationContext/translation.context";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { ThemeContext } from "../services/themeContext/theme.context";
import "../../App.css";
import { useAuth } from "../services/authenticationContext/authentication.context";

function TodoCard({ task, onDeleteTask, onEditTask, onMarkAsCompleted }) {
  const translate = useTranslation();
  const { theme } = useContext(ThemeContext);
  const { language } = useContext(TranslateContext);

  const handleEditClick = () => {
    if (!task.completed) {
      if (task.name.trim() === "") {
        alert("El nombre de la tarea no puede estar vacío.");
        return;
      }

      onEditTask(task);
    }
  };

  return (
    <Card
      className={`mt-1 shadow  ${
        theme === "DARK" && "dark-theme"
      } border-green`}
    >
      <Card.Body className="bg-success" key="success">
        <Card.Title>{task.name}</Card.Title>
        <Card.Text>
          {translate("start_date")}:{" "}
          {new Date(task.startDate).toLocaleDateString(language)}
        </Card.Text>
        <Card.Text>
          {translate("end_date")}:{" "}
          {new Date(task.endDate).toLocaleDateString(language)}
        </Card.Text>
        <Card.Text>{translate("user_id")}: {task.userID}</Card.Text>
        <Form.Check
          type="checkbox"
          label={translate("completed")}
          onClick={() => onMarkAsCompleted(task)}
        />
        <Button
          variant="info"
          onClick={handleEditClick}
          disabled={task.completed}
        >
          {translate("edit")}
        </Button>
        <Button variant="danger" onClick={() => onDeleteTask(task)}>
          {translate("delete")}
        </Button>
      </Card.Body>
    </Card>
  );
}

export default TodoCard;
