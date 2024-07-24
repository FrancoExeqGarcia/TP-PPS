import React, { useState } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../data/axiosConfig";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { Container, Form, Button } from "react-bootstrap";

const AddUser = ({ users, setUsers, setIsAdding }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("Programmer"); // Default value
  const [state, setState] = useState(true);
  const translate = useTranslation();

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      return Swal.fire({
        icon: "error",
        title: translate("sw_all_fields_error_title"),
        text: translate("sw_all_fields_error_text"),
        showConfirmButton: true,
      });
    }

    const newUser = {
      name,
      email,
      password,
      userType,
      state,
    };

    try {
      const response = await axiosInstance.post("/user", newUser);
      const addedUser = response.data;

      setUsers([...users, addedUser]);

      setIsAdding(false);

      Swal.fire({
        icon: "success",
        title: translate("sw_project_add_success_title"),
        text: translate("sw_user_added_text"),
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error adding user:", error);
      Swal.fire({
        icon: "error",
        title: translate("sw_todo_add_error_title"),
        text: translate("sw_user_add_error_text"),
        showConfirmButton: true,
      });
    }
  };

  return (
    <Container className="small-container">
      <Form onSubmit={handleAdd}>
        <h1>{translate("Add User")}</h1>

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
            {translate("Add")}
          </Button>
          <Button
            variant="secondary"
            style={{ marginLeft: "12px" }}
            onClick={() => setIsAdding(false)}
          >
            {translate("Cancel")}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default AddUser;
