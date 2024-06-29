import React, {useContext, useState, useEffect} from "react";
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
import useTranslation from "../../custom/useTranslation/useTranslation";

const Dashboard = ({oneProjectClick}) => {
  const { theme } = useContext(ThemeContext);
  const className = `project-dashboard ${theme === 'oscuro' ? 'dark-theme' : 'light-theme'}`;
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const translate = useTranslation();

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
    setSelectedProject(project);
  };
  return (
    <Container fluid >
      <NavBar />
      <ComboLanguage />
      <Row className="mt-4">
        <Col sm>
          <Card>
            <Card.Body className={className}>
              <ProjectDashboard/>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mt-4">
        </Row>
        {/* <Row className="mt-4">
        <Col sm>
          <Card>
            <Card.Body className={className}>
              <ToDoDashboard 
              projectId={selectedProject.id}
              setSelectedProject={setSelectedProject}/>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
          <ProjectCards
            projects={projects}
            onProjectClick={handleProjectClick}
          />
        </Row> */}
        <Row className="mt-4">
          <Col sm>
          <ProjectCards
            projects={projects}
            onProjectClick={handleProjectClick}
          />
          {selectedProject && (
            <ToDoDashboard
              projectId={selectedProject.id}
              setSelectedProject={setSelectedProject}
            />
          )}
          </Col>
        </Row>
      <Row className="mt-4">
        <Col sm>
          <ChatBotManager />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
