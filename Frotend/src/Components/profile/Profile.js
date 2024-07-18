import React, { useState, useContext, useEffect } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router";
import { ThemeContext } from "../../services/themeContext/theme.context";
import { useAuth } from "../../services/authenticationContext/authentication.context";
import NavBar from "../navBar/NavBar";
import useTranslation from "../../custom/useTranslation/useTranslation";
import ComboLanguage from "../ui/comboLanguage/ComboLanguaje";
import Swal from "sweetalert2";
import axiosInstance from "../../data/axiosConfig";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [userType, setUserType] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const translate = useTranslation();

  const className = `h1 ${theme === "oscuro" ? "dark-theme" : "light-theme"}`;

  useEffect(() => {
    if (user) {
      setEmail(user.Email);
      setName(user.UserName);
      setUserType(user.UserType);
    }
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name || !email || !currentPassword) {
      return Swal.fire({
        icon: "error",
        title: "Error!",
        text: "All fields are required.",
        showConfirmButton: true,
      });
    }

    try {
      const verifyResponse = await axiosInstance.post("/user/verifyPassword", {
        userId: user.UserId,
        password: currentPassword,
        newPassword: newPassword,
      });
      if (verifyResponse.status !== 200) {
        return Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Current password is incorrect.",
          showConfirmButton: true,
        });
      }

      const updatedUser = {
        id: user.UserId,
        name,
        email,
        password: newPassword || currentPassword,
        userType,
        state: true,
      };

      const response = await axiosInstance.put(
        `/user/${user.UserId}`,
        updatedUser
      );

      setUser({
        ...user,
        UserName: response.data.name,
        Email: response.data.email,
        UserType: response.data.userType,
      });

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: `${name}'s data has been updated.`,
        showConfirmButton: false,
        timer: 1500,
      });

      navigate("/home");
    } catch (error) {
      console.error("Error updating user:", error);
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
      <div className="container-lg">
        <h1 className={className}>{translate("Profile")}</h1>
        {error && <p className="text-danger">{error}</p>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formUserName">
            <Form.Label>{translate("Full Name")}</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
    </Container>
  );
};

export default Profile;
