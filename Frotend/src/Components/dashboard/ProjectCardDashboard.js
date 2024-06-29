import React, { useContext, useState, useEffect } from "react";
import { Col, Container, Row, Card } from "react-bootstrap";
import axiosInstance from "../../data/axiosConfig";
import Swal from "sweetalert2";
import ComboLanguage from "../ui/comboLanguage/ComboLanguaje";
import ChatBotManager from "../chatBotManager/ChatBotManager";
import ProjectDashboard from "../projects/ProjectDashboard";
import NavBar from "../navBar/NavBar";
import ToDoDashboard from "../todos/ToDoDashboard";
import { ThemeContext } from "../../services/themeContext/theme.context";
import ProjectCards from "../dashboard/ProjectCards";

const Dashboard = ({ oneProjectClick }) => {
  const { theme } = useContext(ThemeContext);
  const className = `project-dashboard ${
    theme === "oscuro" ? "dark-theme" : "light-theme"
  }`;
  const cardClassName = theme === "oscuro" ? "dark-card" : "light-card";
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    // Fetch projects from the API using Axios
    const fetchProjects = async () => {
      try {
        const response = await axiosInstance.get("/project");
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong while fetching the projects!",
        });
      }
    };

    fetchProjects();
  }, []);

  const handleProjectClick = (project) => {
    setSelectedProjectId(project);
  };

  return (
    <Container fluid>
      <NavBar />
      <ComboLanguage />
      <Row className="mt-4">
        <Col >
          <Card>
            <Card.Body className={cardClassName}>
              <ProjectDashboard />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mt-4">
      </Row>
      <Row className="mt-4">
        <Col >
          {selectedProjectId && (
            <Card>
              <Card.Body className={cardClassName}>
                <ToDoDashboard
                  projectId={selectedProjectId}
                  setSelectedProjectId={setSelectedProjectId}
                />
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Body className={cardClassName}>
              <ProjectCards
                projects={projects}
                onProjectClick={handleProjectClick}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <ChatBotManager />
    </Container>
  );
};

export default Dashboard;
