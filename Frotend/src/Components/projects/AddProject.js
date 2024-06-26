import React, { useState } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../data/axiosConfig";
import useTranslation from "../../custom/useTranslation/useTranslation";

const AddProject = ({ projects, setProjects, setIsAdding }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState(true);
  const translate = useTranslation();

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!name || !description || !startDate || !endDate) {
      return Swal.fire({
        icon: "error",
        title: "Error!",
        text: "All fields are required.",
        showConfirmButton: true,
      });
    }

    const newProject = {
      name,
      description,
      startDate,
      endDate,
      status,
    };

    try {
      const response = await axiosInstance.post("/project", newProject);
      setProjects([...projects, response.data]);
      setIsAdding(false);

      Swal.fire({
        icon: "success",
        title: "Added!",
        text: `${name} project has been added.`,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error adding project:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Something went wrong while adding the project.",
        showConfirmButton: true,
      });
    }
  };

  return (
    <div className="small-container">
      <form onSubmit={handleAdd}>
        <h1>{translate("Add Project")}</h1>
        <label htmlFor="name">{translate("Name")}</label>
        <input
          id="name"
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label htmlFor="description">{translate("Description")}</label>
        <input
          id="description"
          type="text"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label htmlFor="startDate">{translate("Start Date")}</label>
        <input
          id="startDate"
          type="datetime-local"
          name="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label htmlFor="endDate">{translate("End Date")}</label>
        <input
          id="endDate"
          type="datetime-local"
          name="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <label htmlFor="status">{translate("Status")}</label>
        <input
          id="status"
          type="checkbox"
          name="status"
          checked={status}
          onChange={(e) => setStatus(e.target.checked)}
        />
        <div style={{ marginTop: "30px" }}>
          <input type="submit" value="Add" />
          <input
            style={{ marginLeft: "12px" }}
            className="muted-button"
            type="button"
            value="Cancel"
            onClick={() => setIsAdding(false)}
          />
        </div>
      </form>
    </div>
  );
};

export default AddProject;
