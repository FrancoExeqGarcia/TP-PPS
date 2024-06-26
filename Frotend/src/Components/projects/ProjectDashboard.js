import React, { useState, useEffect, useContext } from "react";
import Swal from "sweetalert2";

import axiosInstance from "../../data/axiosConfig";
import { useAuth } from "../../services/authenticationContext/authentication.context";

import ProjectHeader from "./ProjectHeader";
import ProjectTable from "./ProjectTable";
import AddProject from "./AddProject";
import EditProject from "./EditProject";
import { ThemeContext } from "../../services/themeContext/theme.context";

const ProjectDashboard = ({ setIsAuthenticated }) => {
  const { theme } = useContext(ThemeContext);
  const className = `project-dashboard ${
    theme === "oscuro" ? "dark-theme" : "light-theme"
  }`;

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
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

  const handleEdit = (id) => {
    const [project] = projects.filter((project) => project.id === id);

    setSelectedProject(project);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then(async (result) => {
      if (result.value) {
        try {
          await axiosInstance.delete(`/project/${id}`);
          const projectsCopy = projects.filter((project) => project.id !== id);
          setProjects(projectsCopy);

          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: `Project has been deleted.`,
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (error) {
          console.error("Error deleting project:", error);
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "Something went wrong while deleting the project.",
            showConfirmButton: true,
          });
        }
      }
    });
  };

  return (
    <div>
      <div >
        {!isAdding && !isEditing && (
          <>
            <ProjectHeader
              setIsAdding={setIsAdding}
              setIsAuthenticated={setIsAuthenticated}
            />
            <ProjectTable
              projects={projects}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          </>
        )}
        {isAdding && (
          <AddProject
            projects={projects}
            setProjects={setProjects}
            setIsAdding={setIsAdding}
          />
        )}
        {isEditing && (
          <EditProject
            projects={projects}
            selectedProject={selectedProject}
            setProjects={setProjects}
            setIsEditing={setIsEditing}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectDashboard;
