import React, { useState } from "react";
import { Row, Col, Pagination, ButtonGroup, Button } from "react-bootstrap";
import ProjectCard from "./ProjectCard";

// Enum para los estados del proyecto
const ProjectStates = {
  0: "Not Started",
  1: "In Progress",
  2: "Done",
};

const ProjectCards = ({ projects, onProjectClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState(null); // Estado para filtrar proyectos
  const projectsPerPage = 4;

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

  return (
    <>
      <h2>Seleccione un Proyecto:</h2>

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
