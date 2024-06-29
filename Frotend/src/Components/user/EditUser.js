import React, { useState } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../data/axiosConfig";
import useTranslation from "../../custom/useTranslation/useTranslation";

const EditUser = ({ users, selectedUser, setUsers, setIsEditing }) => {
  const id = selectedUser.id;

  const [name, setName] = useState(selectedUser.name);
  const [email, setEmail] = useState(selectedUser.email);
  const [password, setPassword] = useState(selectedUser.password);
  const [userType, setUserType] = useState(selectedUser.userType);
  const [state, setState] = useState(selectedUser.state);
  const translate = useTranslation();

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      return Swal.fire({
        icon: "error",
        title: "Error!",
        text: "All fields are required.",
        showConfirmButton: true,
      });
    }

    const updatedUser = {
      id,
      name,
      email,
      password,
      userType,
      state,
    };

    try {
      const response = await axiosInstance.put(`/user/${id}`, updatedUser);
      setUsers(users.map((user) => (user.id === id ? response.data : user)));
      setIsEditing(false);

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: `${name}'s data has been updated.`,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Something went wrong while updating the user.",
        showConfirmButton: true,
      });
    }
  };

  return (
    <div className="small-container">
      <form onSubmit={handleUpdate}>
      <h1>{translate("Edit User")}</h1>
      <label htmlFor="name">{translate("Name")}</label>
        <input
          id="name"
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label htmlFor="email">{translate("Email")}</label>
        <input
          id="email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">{translate("Password")}</label>
        <input
          id="password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="userType">{translate("User Type")}</label>
        <select
          id="userType"
          name="userType"
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
        >
          <option value="Programmer">{translate("Programmer")}</option>
          <option value="Admin">{translate("Admin")}</option>
          <option value="SuperAdmin">{translate("Super Admin")}</option>
        </select>
        <label htmlFor="state">{translate("State")}</label>
        <input
          id="state"
          type="checkbox"
          name="state"
          checked={state}
          onChange={(e) => setState(e.target.checked)}
        />
        <div style={{ marginTop: "30px" }}>
          <input type="submit" value="Update" />
          <input
            style={{ marginLeft: "12px" }}
            className="muted-button"
            type="button"
            value="Cancel"
            onClick={() => setIsEditing(false)}
          />
        </div>
      </form>
    </div>
  );
};

export default EditUser;
