import React from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../data/axiosConfig";
import Table from 'react-bootstrap/Table';
import useTranslation from "../../custom/useTranslation/useTranslation";

const UserTable = ({ users, setUsers, handleEdit }) => {
  const translate = useTranslation();
  
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
          await axiosInstance.delete(`/user/${id}`);
          const usersCopy = users.filter((user) => user.id !== id);
          setUsers(usersCopy);

          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: `User has been deleted.`,
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (error) {
          console.error("Error deleting user:", error);
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "Something went wrong while deleting the user.",
            showConfirmButton: true,
          });
        }
      }
    });
  };

  users.forEach((user, i) => {
    user.id = i + 1;
  });

  return (
    <div className="contain-table">
      <Table striped bordered hover responsive="sm">
        <thead>
          <tr>
            <th>No.</th>
            <th>{translate("Name")}</th>
            <th>{translate("Email")}</th>
            <th>{translate("User Type")}</th>
            <th>{translate("State")}</th>
            <th colSpan={2} className="text-center">
            {translate("Actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user, i) => (
              <tr key={user.id}>
                <td>{i + 1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.userType}</td>
                <td>{user.state ? "Active" : "Inactive"}</td>
                <td className="text-right">
                  <button
                    onClick={() => handleEdit(user.id)}
                    className="button muted-button"
                  >
                    {translate("Edit")}
                  </button>
                </td>
                <td className="text-left">
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="button muted-button"
                  >
                    {translate("Delete")}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7}>{translate("No Users")}</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default UserTable;
