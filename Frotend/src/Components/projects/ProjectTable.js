import React from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../data/axiosConfig";

const ProjectTable = ({ projects, setProjects, handleEdit }) => {
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
          await axiosInstance.delete(
            `https://localhost:7165/api/project/${id}`
          );
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

  projects.forEach((project, i) => {
    project.id = i + 1;
  });

  return (
    <div className="contain-table">
      <table className="striped-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Name</th>
            <th>Description</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th colSpan={2} className="text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.length > 0 ? (
            projects.map((project, i) => (
              <tr key={project.id}>
                <td>{i + 1}</td>
                <td>{project.name}</td>
                <td>{project.description}</td>
                <td>{project.startDate}</td>
                <td>{project.endDate}</td>
                <td>{project.status ? "Active" : "Inactive"}</td>
                <td className="text-right">
                  <button
                    onClick={() => handleEdit(project.id)}
                    className="button muted-button"
                  >
                    Edit
                  </button>
                </td>
                <td className="text-left">
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="button muted-button"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7}>No Projects</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectTable;
