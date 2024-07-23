import React, { useState, useContext } from "react";
import { Row, Col, Pagination, ButtonGroup, Button } from "react-bootstrap";
import ProjectCard from "./ProjectCard";
import { ThemeContext } from "../../services/themeContext/theme.context";
import useTranslation from "../../custom/useTranslation/useTranslation";


// Enum para los estados del proyecto
const ProjectStates = {
  0: "Not Started",
  1: "In Progress",
  2: "Done",
};

// Colores asociados a los estados
const StateColors = {
  0: "#6c757d", // Gris
  1: "#007bff", // Azul
  2: "#28a745", // Verde
};

const ProjectCards = ({ projects, onProjectClick }) => {
  const translate = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState(null); // Estado para filtrar proyectos
  const projectsPerPage = 4;
  const { theme } = useContext(ThemeContext);
  // Filtrar proyectos según el estado seleccionado
  const filteredProjects =
    filter === null
      ? projects
      : projects.filter((project) => project.projectState === filter);

  // Paginación
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (
    let i = 1;
    i <= Math.ceil(filteredProjects.length / projectsPerPage);
    i++
  ) {
    pageNumbers.push(i);
  }
  const className = `h1 ${
    theme === "oscuro" ? "dark-theme" : "light-theme"
  }`;

  return (
    <>
      <div className="color-explanation mb-4">
      <h1 className={className}>{translate("select_project")}</h1>
        <div className="d-flex align-items-center">
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: StateColors[0],
              marginRight: "10px",
              borderRadius: "3px",
            }}
          ></div>
          <span className="me-3">Not Started</span>
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: StateColors[1],
              marginRight: "10px",
              borderRadius: "3px",
            }}
          ></div>
          <span className="me-3">In Progress</span>
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: StateColors[2],
              marginRight: "10px",
              borderRadius: "3px",
            }}
          ></div>
          <span>Done</span>
        </div>
      </div>

      <div className="filter-section mb-4">
        <h6 className="mb-2">Filtrar por:</h6>
        <ButtonGroup>
          <Button
            variant={filter === null ? "primary" : "secondary"}
            onClick={() => setFilter(null)}
            className="btn-m"
          >
            All
          </Button>
          <Button
            variant={filter === 0 ? "primary" : "secondary"}
            onClick={() => setFilter(0)}
            className="btn-m"
          >
            {ProjectStates[0]}
          </Button>
          <Button
            variant={filter === 1 ? "primary" : "secondary"}
            onClick={() => setFilter(1)}
            className="btn-m"
          >
            {ProjectStates[1]}
          </Button>
          <Button
            variant={filter === 2 ? "primary" : "secondary"}
            onClick={() => setFilter(2)}
            className="btn-m"
          >
            {ProjectStates[2]}
          </Button>
        </ButtonGroup>
      </div>

      <Row>
        {currentProjects.length > 0 ? (
          currentProjects.map((project) => (
            <Col key={project.id}>
              <ProjectCard project={project} onProjectClick={onProjectClick} />
            </Col>
          ))
        ) : (
          <Col>
            <p>No projects found</p>
          </Col>
        )}
      </Row>

      <Pagination className="mt-3">
        {pageNumbers.map((number) => (
          <Pagination.Item key={number} onClick={() => paginate(number)}>
            {number}
          </Pagination.Item>
        ))}
      </Pagination>
    </>
  );
};

export default ProjectCards;
