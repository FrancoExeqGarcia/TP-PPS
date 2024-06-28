import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../data/axiosConfig";

import UserHeader from "./UserHeader";
import UserTable from "./UserTable";
import AddUser from "./AddUser";
import EditUser from "./EditUser";

const UserDashboard = ({ setIsAuthenticated }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Fetch users from the API using Axios
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get(
          "https://localhost:7165/api/user"
        );
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
    <div className="container">
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
          />
        </>
      )}
      {isAdding && (
        <AddUser users={users} setUsers={setUsers} setIsAdding={setIsAdding} />
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
  );
};

export default UserDashboard;
