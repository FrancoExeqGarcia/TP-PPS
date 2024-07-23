import React, { useContext } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../data/axiosConfig";
import Table from "react-bootstrap/Table";
import { ThemeContext } from "../../services/themeContext/theme.context";
import { Button } from "react-bootstrap";
import useTranslation from "../../custom/useTranslation/useTranslation";

const ProjectTable = ({ projects, setProjects, handleEdit }) => {
  const { theme } = useContext(ThemeContext);
  const translate = useTranslation();

  const ProjectStates = {
    0: translate("not_started"),
    1: translate("in_progress"),
    2: translate("done"),
  };

  const className = `project-dashboard ${
    theme === "oscuro" ? "dark-theme" : "light-theme"
  }`;

  const handleDelete = async (id) => {
    Swal.fire({
      icon: "warning",
      title: translate("sw_warning_title"),
      text: translate("sw_warning_text"),
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then(async (result) => {
      if (result.value) {
        try {
          const response = await axiosInstance.delete(`/project/${id}`);
          const projectsCopy = projects.filter((project) => project.id !== id);
          setProjects(projectsCopy);
  
          Swal.fire({
            icon: "success",
            title: translate("sw_success_title"),
            text: translate("sw_success_text"),
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (error) {
          console.error("Error deleting project:", error.response?.data?.message || error.message);
          Swal.fire({
            icon: "error",
            title: translate("sw_error_title"),
            text: translate("sw_delete_error_text"),
            showConfirmButton: true,
          });
        }
      }
    });
  };

  return (
    <div>
      <Table
        striped
        bordered
        hover
        responsive="sm"
        variant={theme === "oscuro" ? "dark" : "light"}
      >
        <thead>
          <tr>
            <th>No.</th>
            <th>{translate("Name")}</th>
            <th>{translate("Description")}</th>
            <th>{translate("Start Date")}</th>
            <th>{translate("End Date")}</th>
            <th>{translate("project_states")}</th>
            <th colSpan={2} className="text-center">
              {translate("Actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.length > 0 ? (
            projects.map((project) => (
              <tr key={project.id}>
                <td>{project.id}</td>
                <td>{project.name}</td>
                <td>{project.description}</td>
                <td>{project.startDate}</td>
                <td>{project.endDate}</td>
                <td>{ProjectStates[project.projectState]}</td>
                <td className="text-center">
                  <Button onClick={() => handleEdit(project)} variant="primary">
                    {translate("Edit")}
                  </Button>
                </td>
                <td className="text-center">
                  <Button
                    onClick={() => handleDelete(project.id)}
                    variant="danger"
                  >
                    {translate("Delete")}
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="text-center">
                {translate("No Projects")}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ProjectTable;
