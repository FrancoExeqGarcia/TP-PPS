import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../data/axiosConfig";
import { Container, Button } from "react-bootstrap";
import UserHeader from "./UserHeader";
import UserTable from "./UserTable";
import AddUser from "./AddUser";
import EditUser from "./EditUser";
import NavBar from "../navBar/NavBar";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { useNavigate } from "react-router";

const UserDashboard = ({ setIsAuthenticated }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const translate = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/user");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong while fetching the users!",
        });
      }
    };

    fetchUsers();
  }, []);

  const handleBackToHome = () => {
    navigate("/home");
  };

  const handleEdit = (id) => {
    const [user] = users.filter((user) => user.id === id);

    setSelectedUser(user);
    setIsEditing(true);
  };

  return (
    <Container fluid className="container-fluid">
      <NavBar />
      <div className="user-table-container container-lg">
        {!isAdding && !isEditing && (
          <>
            <UserHeader
              setIsAdding={setIsAdding}
              setIsAuthenticated={setIsAuthenticated}
            />
            <UserTable
              users={users}
              setUsers={setUsers}
              handleEdit={handleEdit}
              className="user-table"
            />
          </>
        )}
        {isAdding && (
          <AddUser
            users={users}
            setUsers={setUsers}
            setIsAdding={setIsAdding}
          />
        )}
        {isEditing && (
          <EditUser
            users={users}
            selectedUser={selectedUser}
            setUsers={setUsers}
            setIsEditing={setIsEditing}
          />
        )}
        <Button variant="primary" onClick={handleBackToHome} className="mt-3">
          {translate("Back to Home")}
        </Button>
      </div>
    </Container>
  );
};

export default UserDashboard;
