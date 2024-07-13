import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../data/axiosConfig";
import { Container } from "react-bootstrap";
import UserHeader from "./UserHeader";
import UserTable from "./UserTable";
import AddUser from "./AddUser";
import EditUser from "./EditUser";
import NavBar from "../navBar/NavBar";
import ComboLanguage from "../ui/comboLanguage/ComboLanguaje";

const UserDashboard = ({ setIsAuthenticated }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleEdit = (id) => {
    const [user] = users.filter((user) => user.id === id);

    setSelectedUser(user);
    setIsEditing(true);
  };

  return (
    <Container fluid className="container-fluid">
      <NavBar />
      <ComboLanguage />
      <div className="user-table-container">
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
      </div>
    </Container>
  );
};

export default UserDashboard;
