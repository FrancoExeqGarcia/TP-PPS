import React, { useState } from "react";
import { Row, Col, Pagination } from "react-bootstrap";
import ProjectCard from "./ProjectCard";

const ProjectCards = ({ projects, onProjectClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 4;

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(projects.length / projectsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <Row>
        {currentProjects.map((project) => (
          <Col key={project.id}>
            <ProjectCard project={project} onProjectClick={onProjectClick} />
          </Col>
        ))}
      </Row>
      <Pagination>
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
