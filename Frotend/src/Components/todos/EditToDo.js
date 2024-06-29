import React, { useState } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../data/axiosConfig";
import useTranslation from "../../custom/useTranslation/useTranslation";

const EditToDo = ({ todos, selectedToDo, setTodos, setIsEditing, users }) => {
  const id = selectedToDo.id;

  const [name, setName] = useState(selectedToDo.name);
  const [startDate, setStartDate] = useState(selectedToDo.startDate);
  const [endDate, setEndDate] = useState(selectedToDo.endDate);
  const [state, setState] = useState(selectedToDo.state);
  const [isCompleted, setIsCompleted] = useState(selectedToDo.isCompleted);
  const translate = useTranslation();
  const [assignedUserId, setAssignedUserId] = useState(
    selectedToDo.assignedUserId || ""
  );

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!name || !startDate || !endDate) {
      return Swal.fire({
        icon: "error",
        title: "Error!",
        text: "All fields are required.",
        showConfirmButton: true,
      });
    }

    const updatedToDo = {
      id,
      name,
      startDate,
      endDate,
      state,
      isCompleted,
      assignedUserId: assignedUserId || null,
    };

    try {
      const response = await axiosInstance.put(`/todo/${id}`, updatedToDo);
      setTodos(todos.map((todo) => (todo.id === id ? response.data : todo)));
      setIsEditing(false);

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: `${name} todo has been updated.`,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error updating todo:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Something went wrong while updating the todo.",
        showConfirmButton: true,
      });
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleUpdate}>
        <h1>{translate("Edit ToDo")}</h1>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
          {translate("Name")}
          </label>
          <input
            id="name"
            type="text"
            className="form-control"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="startDate" className="form-label">
          {translate("Start Date")}
          </label>
          <input
            id="startDate"
            type="datetime-local"
            className="form-control"
            name="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="endDate" className="form-label">
          {translate("End Date")}
          </label>
          <input
            id="endDate"
            type="datetime-local"
            className="form-control"
            name="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="mb-3 form-check">
          <input
            id="state"
            type="checkbox"
            className="form-check-input"
            name="state"
            checked={state}
            onChange={(e) => setState(e.target.checked)}
          />
          <label htmlFor="state" className="form-check-label">
          {translate("State")}
          </label>
        </div>
        <div className="mb-3 form-check">
          <input
            id="isCompleted"
            type="checkbox"
            className="form-check-input"
            name="isCompleted"
            checked={isCompleted}
            onChange={(e) => setIsCompleted(e.target.checked)}
          />
          <label htmlFor="isCompleted" className="form-check-label">
          {translate("Is Completed")}
          </label>
        </div>
        <div className="mb-3">
          <label htmlFor="assignedUserId" className="form-label">
          {translate("Assigned User")}
          </label>
          <select
            id="assignedUserId"
            className="form-select"
            name="assignedUserId"
            value={assignedUserId}
            onChange={(e) => setAssignedUserId(e.target.value)}
          >
            <option value="">{translate("Select User")}</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <button type="submit" className="btn btn-primary me-2">
            {translate("Update")}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsEditing(false)}
          >
            {translate("Cancel")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditToDo;
