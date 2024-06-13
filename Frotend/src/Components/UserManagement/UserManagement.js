import React, { useState, useEffect, useContext } from "react";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { ThemeContext } from "../services/themeContext/theme.context";
import { Card, Button, Form } from "react-bootstrap";
import "../../App.css";
import Header from "../header/Header";
import { useAuth } from "../services/authenticationContext/authentication.context";

const UserManagement = () => {
  const [language, setLanguage] = useState("es");
  const translate = useTranslation(language);
  const { theme } = useContext(ThemeContext);
  const { user } = useAuth(); 

  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getUsers();
  }, [language]);

  const getUsers = async () => {
    try {
      const response = await fetch("https://localhost:7166/api/User", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(translate("error_obtain_user"));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.role) {
      setError(translate("complete_all_fields"));
      return;
    }

    try {
      const response = await fetch("https://localhost:7166/api/User", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setUsers([...users, data]);
      setFormData({
        email: "",
        password: "",
        role: "",
      });
      setError(null);
    } catch (error) {
      console.error(translate("error_add_user"));
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.role) {
      setError(translate("complete_required_fields"));
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:7166/api/User/${editingUser.userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      const updatedUsers = users.map((user) =>
        user.userId === data.userId ? data : user
      );
      setUsers(updatedUsers);
      setEditingUser(null);
      setFormData({
        email: "",
        password: "",
        role: "",
      });
      setIsEditing(false);
      setError(null);
    } catch (error) {
      console.error(translate("error_edit_user"));
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await fetch(`https://localhost:7166/api/User/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const updatedUsers = users.filter((user) => user.userId !== userId);
      setUsers(updatedUsers);
    } catch (error) {
      console.error(translate("error_delete_user"));
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: "",
      role: user.userType,
    });
    setIsEditing(true);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setFormData({
      email: "",
      password: "",
      role: "",
    });
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className={`wrapper ${theme === "oscuro" ? "dark-theme" : ""}`}>
      <Header />
      <div className="container mt-1 shadow p-4 border-gray content">
        <div className="row">
          <div className="col-md-3">
            <h2>{translate("administer_users")}</h2>
            <ul>
              {users.map((user) => (
                <li key={user.userId}>
                  {user.email}{" "}
                  <button
                    type="submit"
                    className={`${
                      theme === "oscuro"
                        ? "btn-outline-light"
                        : "btn-outline-dark"
                    } me-2`}
                    onClick={() => handleEditClick(user)}
                  >
                    {translate("edit")}
                  </button>{" "}
                  <button
                    type="submit"
                    className={`${
                      theme === "oscuro"
                        ? "btn-outline-light"
                        : "btn-outline-dark"
                    }`}
                    onClick={() => handleDeleteUser(user.userId)}
                  >
                    {translate("delete")}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-md-9">
            <h3>
              {isEditing ? translate("edit_admin") : translate("create_admin")}
            </h3>
            {error && (
              <div
                className={`alert alert-danger ${
                  theme === "oscuro" ? "text-light" : ""
                }`}
              >
                {error}
              </div>
            )}
            <form onSubmit={isEditing ? handleEditUser : handleAddUser}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  {translate("email")}
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  {translate("password")}
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="role" className="form-label">
                  {translate("user_role")}
                </label>
                <select
                  className="form-select"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>
                    {translate("select_role")}
                  </option>
                  <option value="Programer">{translate("user")}</option>
                  <option value="SysAdmin">{translate("sysadmin")}</option>
                  <option value="Admin">{translate("admin")}</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">
                {isEditing ? translate("save") : translate("register")}
              </button>
              {isEditing && (
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={handleCancelEdit}
                >
                  {translate("cancel")}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
