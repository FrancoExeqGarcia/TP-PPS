import React, { useState, useContext } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { useAuth } from "../services/authenticationContext/authentication.context";
import { useNavigate } from "react-router";
import Header from "../header/Header";
import { ThemeContext } from "../services/themeContext/theme.context";

const Profile = () => {
  const { user, updateUser, validatePassword } = useAuth();
  const [email, setEmail] = useState(user.email);
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isValid = await validatePassword(currentPassword);
    if (!isValid) {
      setError("Current password is incorrect.");
      return;
    }
    updateUser({ email, firstName, lastName, password: newPassword });
    navigate("/home");
  };

  return (
    <div className={`wrapper ${theme === "oscuro" ? "dark-theme" : ""}`}>
      <Header />
      <div className="container mt-1 shadow p-4 border-gray content">
        <div className="row">
          <div className="col-md-3">
            <h2>Profile</h2>
            {error && <p className="text-danger">{error}</p>}
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formFirstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="formLastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="formCurrentPassword">
                <Form.Label>Current Password</Form.Label>
                <Form.Control
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formNewPassword">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
