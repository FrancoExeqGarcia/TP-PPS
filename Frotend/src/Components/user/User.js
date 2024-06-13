import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Alert } from "react-bootstrap";
import { useAuth } from "../services/authenticationContext/authentication.context";
import UserCard from "../userCard/UserCard";
import { ThemeContext } from "../services/themeContext/theme.context";
import useTranslation from "../../custom/useTranslation/useTranslation";

const User = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const { theme } = useContext(ThemeContext);
  const translate = useTranslation();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("https://localhost:7166/api/User", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Error fetching users.");
    }
  };

  return (
    <Container className={`wrapper ${theme === "oscuro" ? "dark-theme" : ""}`}>
      <h2>{translate("user_list")}</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Row className="mt-4">
        {users.map((user) => (
          <Col key={user.userId} xs={12} md={6} lg={4} className="mb-3">
            <UserCard user={user} />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default User;
