import React from "react";
import { Card } from "react-bootstrap";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { ThemeContext } from "../../services/themeContext/theme.context";

const ToDoCard = ({ todo }) => {
  const translate = useTranslation();
  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>{todo.name}</Card.Title>
        <Card.Text>{translate("Start Date")}: {todo.startDate}</Card.Text>
        <Card.Text>{translate("End Date")}: {todo.endDate}</Card.Text>
        <Card.Text>{translate("Status")}: {todo.state ? "Active" : "Inactive"}</Card.Text>
        <Card.Text>{translate("Is Completed")}: {todo.isCompleted ? "Yes" : "No"}</Card.Text>
        <Card.Text>{translate("Assigned User")}: {todo.assignedUserId ? todo.assignedUserId : "Unassigned"}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ToDoCard;
