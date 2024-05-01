import React, { useState,useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import useTranslation from "../../custom/useTranslation/useTranslation";
import ProjectForm from "../projectForm/ProjectForm";
import EditProject from "../editProject/EditProject";
import ProjectCard from "../projectCard/ProjectCard";
import Todos from "../todos/Todos";



function Projects({ onProjectClick }) {
  const translate = useTranslation()

  const [projects, setProjectsState] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [userID, setUserID] = useState("");
  const [filteredProjects, setFilteredProjects] = useState([]); 
  const [userRole, setUserRole] = useState("");

  const setProjects = (newProjects) => {
    setProjectsState(newProjects);
    saveProjectsToLocalStorage(newProjects);
  };

  const saveProjectsToLocalStorage = (projects) => {
    localStorage.setItem("projects", JSON.stringify(projects));
  };

  useEffect(() => {
    const storedProjects = localStorage.getItem("projects");
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }
    const storedUserID = Number(localStorage.getItem("userID"));
    if (storedUserID) {
      setUserID(storedUserID);
    }
    const storedUserRole = localStorage.getItem("userRole");
    if (storedUserRole) {
      setUserRole(storedUserRole);
    }
  }, []);

  useEffect(() => {
    if (userRole === '"user"') {
      const newFilteredProjects = projects.filter((project) => project.userID === userID);
      setFilteredProjects(newFilteredProjects);
    } else {
      setFilteredProjects(projects);
    }
  }, [projects, userID, userRole]);
  
  const addProject = (newProject) => {
    setProjects([...projects, newProject]);
  };

  const deleteProject = (index) => {
    const updatedProjects = [...projects];
    updatedProjects.splice(index, 1);
    setProjects(updatedProjects);
  };

  const markprojectAsCompleted = (project) => {
    setProjects((prevprojects) =>
      prevprojects.map((t) =>
        t.id === project.id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const deleteCompletedProjects = () => {
    const incompleteProjects = projects.filter((project) => !project.completed);
    setProjects(incompleteProjects);
  };

  const editProject = (project) => {
    if (!project.completed) {
      setEditingProject(project);
    }
  };
  

  const saveEditedProject = (editedProject) => {
    const updatedProjects = projects.map((project) =>
      project.id === editedProject.id ? editedProject : project
    );
    setProjects(updatedProjects);
    setEditingProject(null); 
  };
  

  const cancelEdit = () => {
    setEditingProject(null); 
  };

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-4">{translate("list_of_projects")}</h1>

      {userRole !== '"user"' && (
        <ProjectForm
          onAddProject={addProject}
          onDeleteCompletedproject={deleteCompletedProjects}
        />
      )}
      <Row className="mt-4">
        {filteredProjects.map((project, index) => (
          <Col key={index} xs={12} md={6} lg={4} className="mb-3">
            {editingProject === project ? (
              <EditProject
                project={project}
                onUpdateProject={saveEditedProject}
                onCancel={cancelEdit}
              />
            ) : (
              <ProjectCard
                project={project}
                onDeleteProject={() => deleteProject(index)}
                onEditProject={editProject}
                onMarkAsCompleted={markprojectAsCompleted}
                onProjectClick={() => onProjectClick(project.id)}
              />
            )}
          </Col>
        ))}
      </Row>
      <Row>
      <Col xs={12} className="text-center mt-4">
        <Todos/>
      </Col>
    </Row>
    </Container>
  );
}

export default Projects;