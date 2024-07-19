import React, { useState, useContext } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../data/axiosConfig";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { Container, Form, Button } from "react-bootstrap";
import { ThemeContext } from "../../services/themeContext/theme.context";

const AddProject = ({ projects, setProjects, setIsAdding }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const translate = useTranslation();
  const { theme } = useContext(ThemeContext);
  const className = `h1 ${theme === "oscuro" ? "dark-theme" : "light-theme"}`;

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!name || !description || !startDate || !endDate) {
      return Swal.fire({
        icon: "error",
        title: "Error!",
        text: "All fields are required.",
        showConfirmButton: true,
      });
    }

    const newProject = {
      name,
      description,
      startDate,
      endDate,
      status:1,

    };

    try {
      const response = await axiosInstance.post("/project", newProject);
      setProjects([...projects, response.data]);
      setIsAdding(false);

      Swal.fire({
        icon: "success",
        title: "Added!",
        text: `${name} project has been added.`,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error adding project:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Something went wrong while adding the project.",
        showConfirmButton: true,
      });
    }
  };

  return (

      <Container className="small-container">
        <Form onSubmit={handleAdd}>
          <h1>{translate("Add Project")}</h1>
          
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>{translate("Name")}</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="description">
            <Form.Label>{translate("Description")}</Form.Label>
            <Form.Control
              type="text"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="startDate">
            <Form.Label>{translate("Start Date")}</Form.Label>
            <Form.Control
              type="datetime-local"
              name="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="endDate">
            <Form.Label>{translate("End Date")}</Form.Label>
            <Form.Control
              type="datetime-local"
              name="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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
    <Container className="small-container">
      <Form onSubmit={handleAdd}>
        <h1 className={className}>{translate("Add Project")}</h1>

        <Form.Group className="mb-3" controlId="name">
          <Form.Label>{translate("Name")}</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="description">
          <Form.Label>{translate("Description")}</Form.Label>
          <Form.Control
            type="text"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="startDate">
          <Form.Label>{translate("Start Date")}</Form.Label>
          <Form.Control
            type="datetime-local"
            name="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="endDate">
          <Form.Label>{translate("End Date")}</Form.Label>
          <Form.Control
            type="datetime-local"
            name="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="state">
          <Form.Check
            type="checkbox"
            name="state"
            checked={state}
            onChange={(e) => setState(e.target.checked)}
            label={translate("Status")}
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

export default AddProject;
