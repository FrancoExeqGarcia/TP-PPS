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
  const [selectedProject, setSelectedProject] = useState(null);

  const translate = useTranslation();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axiosInstance.get("/project");
        setProjects(response.data);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: translate("sw_oops_title"),
          text: translate("sw_wrong_project"),
        });
      }
    };

    fetchProjects();
  }, []);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
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
            {selectedProject && (
              <Card>
                <ToDoDashboard
                  projectId={selectedProject}
                  setSelectedProjectId={setSelectedProject}
                  projects={projects}
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
