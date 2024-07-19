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

  const className = `project-dashboard ${
    theme === "oscuro" ? "dark-theme" : "light-theme"
  }`;

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
          const response = await axiosInstance.delete(`/project/${id}`);
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
            <th>{translate("Status")}</th>
            <th colSpan={2} className="text-center">
              {translate("Actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.length > 0 ? (
            projects.map((project, i) => (
              <tr key={project.id}>
                <td>{project.id}</td>
                <td>{project.name}</td>
                <td>{project.description}</td>
                <td>{project.startDate}</td>
                <td>{project.endDate}</td>
                <td>{project.status === 1 ? "Active" : "Inactive"}</td>

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
              <td colSpan={8} className="text-center">
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
