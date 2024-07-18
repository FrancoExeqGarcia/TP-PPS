import React, { useContext } from "react";
import { Card } from "react-bootstrap";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { ThemeContext } from "../../services/themeContext/theme.context";

const ToDoCard = ({ todo }) => {
  const translate = useTranslation();
  const { theme } = useContext(ThemeContext);

  return (
    <Card 
    style={{
      width: "18rem",
      cursor: "pointer",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      transition: "border-color 0.3s ease",
    }}
    className={`project-card`}
    >
      <Card.Body>
        <Card.Title style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          {todo.name}
        </Card.Title>
        <Card.Text>
          <strong>{translate("Start Date")}:</strong> {todo.startDate}
        </Card.Text>
        <Card.Text>
          <strong>{translate("End Date")}:</strong> {todo.endDate}
        </Card.Text>
        <Card.Text>
          <strong>{translate("Statuss")}:</strong> {todo.state ? "Active" : "Inactive"}
        </Card.Text>
        <Card.Text>
          <strong>{translate("Is Completed")}:</strong> {todo.isCompleted ? "Yes" : "No"}
        </Card.Text>
        <Card.Text>
          <strong>{translate("Assigned User")}:</strong> {todo.assignedUserId ? todo.assignedUserId : "Unassigned"}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ToDoCard;
