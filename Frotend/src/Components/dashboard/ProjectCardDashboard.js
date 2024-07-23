import React, { useContext, useState, useEffect } from "react";
import { Col, Container, Row, Card } from "react-bootstrap";
import axiosInstance from "../../data/axiosConfig";
import Swal from "sweetalert2";
import ChatBotManager from "../chatBotManager/ChatBotManager";
import ProjectDashboard from "../projects/ProjectDashboard";
import NavBar from "../navBar/NavBar";
import ToDoDashboard from "../todos/ToDoDashboard";
import { ThemeContext } from "../../services/themeContext/theme.context";
import ProjectCards from "../dashboard/ProjectCards";
import { useAuth } from "../../services/authenticationContext/authentication.context";
import useTranslation from "../../custom/useTranslation/useTranslation";

const Dashboard = () => {
  const { theme } = useContext(ThemeContext);
  const className = `project-dashboard ${
    theme === "oscuro" ? "dark-theme" : "light-theme"
  }`;
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const translate = useTranslation();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axiosInstance.get("/project");
        setProjects(response.data);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: translate("sw_wrong_project"),
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
      <div className="container-lg">
        <Row variant={theme === "oscuro" ? "dark" : "light"} className="mt-4">
          <Col>
            {user.UserType !== "Programmer" && (
              <Card>
                <ProjectDashboard
                  projects={projects}
                  setProjects={setProjects}
                />
              </Card>
            )}
          </Col>
        </Row>
        <Row className="mt-4"></Row>
        <Row className="mt-4">
          <Col>
            <Card className={className}>
              <ProjectCards
                projects={projects}
                onProjectClick={handleProjectClick}
              />
            </Card>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col>
            {selectedProjectId && (
              <Card>
                <ToDoDashboard
                  projectId={selectedProjectId}
                  setSelectedProjectId={setSelectedProjectId}
                />
              </Card>
            )}
          </Col>
        </Row>
        <ChatBotManager />
      </div>
    </Container>
  );
};

export default Dashboard;
