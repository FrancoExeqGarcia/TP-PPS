import React, { useState, useContext } from "react";
import Swal from "sweetalert2";
import { Container, Form, Button } from "react-bootstrap";
import axiosInstance from "../../data/axiosConfig";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { ThemeContext } from "../../services/themeContext/theme.context";

const EditUser = ({ users, selectedUser, setUsers, setIsEditing }) => {
  const id = selectedUser.id;

  const [name, setName] = useState(selectedUser.name);
  const [email, setEmail] = useState(selectedUser.email);
  const [password, setPassword] = useState(selectedUser.password);
  const [userType, setUserType] = useState(selectedUser.userType);
  const [state, setState] = useState(selectedUser.state);
  const translate = useTranslation();
  const { theme } = useContext(ThemeContext);
  const className = `h1 ${theme === "oscuro" ? "dark-theme" : "light-theme"}`;

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      return Swal.fire({
        icon: "error",
        title: "Error!",
        text: "All fields are required.",
        showConfirmButton: true,
      });
    }

    const updatedUser = {
      id,
      name,
      email,
      password,
      userType,
      state,
    };

    try {
      const response = await axiosInstance.put(`/user/${id}`, updatedUser);
      const updatedUsers = users.map((user) =>
        user.id === id ? response.data : user
      );
      setUsers(updatedUsers);
      setIsEditing(false);

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: `${name}'s data has been updated.`,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Something went wrong while updating the user.",
        showConfirmButton: true,
      });
    }
  };

  return (
    <Container className="small-container">
      <Form onSubmit={handleUpdate}>
        <h1 className={className}>{translate("Edit User")}</h1>

        <Form.Group className="mb-3" controlId="name">
          <Form.Label>{translate("Name")}</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="email">
          <Form.Label>{translate("Email")}</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="password">
          <Form.Label>{translate("Password")}</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="userType">
          <Form.Label>{translate("User Type")}</Form.Label>
          <Form.Select
            name="userType"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
          >
            <option value="Programmer">{translate("Programmer")}</option>
            <option value="Admin">{translate("Admin")}</option>
            <option value="SuperAdmin">{translate("Super Admin")}</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3" controlId="state">
          <Form.Check
            type="checkbox"
            name="state"
            checked={state}
            onChange={(e) => setState(e.target.checked)}
            label={translate("State")}
          />
        </Form.Group>

        <div style={{ marginTop: "30px" }}>
          <Button variant="primary" type="submit">
            {translate("Update")}
          </Button>
          <Button
            variant="secondary"
            style={{ marginLeft: "12px" }}
            onClick={() => setIsEditing(false)}
          >
            {translate("Cancel")}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default EditUser;
