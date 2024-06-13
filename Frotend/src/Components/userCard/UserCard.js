import React, { useContext } from "react";
import { Card, Button } from "react-bootstrap";
import { ThemeContext } from "../services/themeContext/theme.context";
import useTranslation from "../../custom/useTranslation/useTranslation";
import "../../App.css";

function UserCard({ user }) {
  const translate = useTranslation();
  const { theme } = useContext(ThemeContext);

  return (
    <Card className={`mt-1 shadow ${theme === "oscuro" && "dark-theme"} border-green`}>
      <Card.Body className="bg-info" key={user.userId}>
        <Card.Title>{user.userName}</Card.Title>
        <Card.Text>{translate("email")}: {user.email}</Card.Text>
        <Card.Text>{translate("user_role")}: {user.userType}</Card.Text>
      </Card.Body>
    </Card>
  );
}

export default UserCard;
