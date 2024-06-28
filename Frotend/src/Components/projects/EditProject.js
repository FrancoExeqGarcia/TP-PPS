import React, { useState } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../data/axiosConfig";

const EditProject = ({
  projects,
  selectedProject,
  setProjects,
  setIsEditing,
}) => {
  const id = selectedProject.id;

  const [name, setName] = useState(selectedProject.name);
  const [description, setDescription] = useState(selectedProject.description);
  const [startDate, setStartDate] = useState(selectedProject.startDate);
  const [endDate, setEndDate] = useState(selectedProject.endDate);
  const [status, setStatus] = useState(selectedProject.status);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!name || !description || !startDate || !endDate) {
      return Swal.fire({
        icon: "error",
        title: "Error!",
        text: "All fields are required.",
        showConfirmButton: true,
      });
    }

    const updatedProject = {
      id,
      name,
      description,
      startDate,
      endDate,
      status,
    };

    try {
      const response = await axiosInstance.put(
        `/project/${id}`,
        updatedProject
      );
      setProjects(
        projects.map((project) => (project.id === id ? response.data : project))
      );
      setIsEditing(false);

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: `${name} project has been updated.`,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error updating project:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Something went wrong while updating the project.",
        showConfirmButton: true,
      });
    }
  };

  return (
    <div className="small-container">
      <form onSubmit={handleUpdate}>
        <h1>Edit Project</h1>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label htmlFor="description">Description</label>
        <input
          id="description"
          type="text"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label htmlFor="startDate">Start Date</label>
        <input
          id="startDate"
          type="datetime-local"
          name="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label htmlFor="endDate">End Date</label>
        <input
          id="endDate"
          type="datetime-local"
          name="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <label htmlFor="status">Status</label>
        <input
          id="status"
          type="checkbox"
          name="status"
          checked={status}
          onChange={(e) => setStatus(e.target.checked)}
        />
        <div style={{ marginTop: "30px" }}>
          <input type="submit" className="btn btn-primary" value="Update" />
          <input
            style={{ marginLeft: "12px" }}
            className="btn btn-primary"
            type="button"
            value="Cancel"
            onClick={() => setIsEditing(false)}
          />
        </div>
      </form>
    </div>
  );
};

export default EditProject;
