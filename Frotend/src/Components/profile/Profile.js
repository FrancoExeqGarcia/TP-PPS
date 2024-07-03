import React, { useState, useContext, useEffect } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router";
import Header from "../header/Header";
import { ThemeContext } from "../../services/themeContext/theme.context";
import { useAuth } from "../../services/authenticationContext/authentication.context";
import NavBar from "../navBar/NavBar";
import useTranslation from "../../custom/useTranslation/useTranslation";
import ComboLanguage from "../ui/comboLanguage/ComboLanguaje";

const Profile = () => {
  const { user, fetchUserProfile, updateUser } = useAuth();
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userType, setUserType] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const translate = useTranslation();

  const className = `h1 ${
    theme === "oscuro" ? "dark-theme" : "light-theme"
  }`;

  useEffect(() => {
    const getUserData = async () => {
      await fetchUserProfile();
    };
    getUserData();
  }, []);

  useEffect(() => {
    if (user) {
      setEmail(user.Email);
      setUserName(user.UserName);
      setUserType(user.UserType);
    }
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await updateUser({ email, userName, userType, password: newPassword });
      navigate("/home");
    } catch (error) {
      setError("Error updating user profile.");
    }
  };

  const handleBackToHome = () => {
    navigate("/home");
  };

  return (
    <Container fluid>
      <NavBar />
      <ComboLanguage />
      <div className="container mt-1 shadow p-4 border-gray content">
        <div className="row">
          <div className="col-md-3">
            <h1 className={className}>{translate("Profile")}</h1>
            {error && <p className="text-danger">{error}</p>}
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formUserName">
                <Form.Label>{translate("Full Name")}</Form.Label>
                <Form.Control
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="formUserType">
                <Form.Label>{translate("Role")}</Form.Label>
                <Form.Control
                  type="text"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  readOnly
                />
              </Form.Group>

              <Form.Group controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly
                />
              </Form.Group>

              <Form.Group controlId="formCurrentPassword">
                <Form.Label>{translate("Current Password")}</Form.Label>
                <Form.Control
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formNewPassword">
                <Form.Label>{translate("New Password")}</Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit">
                {translate("Save Changes")}
              </Button>
            </Form>
            <Button variant="primary" onClick={handleBackToHome} className="mt-3">
              {translate("Back to Home")}
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Profile;