import React, { useContext } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../data/axiosConfig";
import Table from "react-bootstrap/Table";
import { Button } from "react-bootstrap";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { ThemeContext } from "../../services/themeContext/theme.context";

const UserTable = ({ users, setUsers, handleEdit }) => {
  const translate = useTranslation();
  const { theme } = useContext(ThemeContext);

  const handleDelete = async (id) => {
    Swal.fire({
      icon: "warning",
      title: translate("sw_confirmation_title"),
      text: translate("sw_confirmation_text"),
      showCancelButton: true,
      confirmButtonText: translate("sw_confirmation_confirm_text"),
      cancelButtonText: translate("sw_confirmation_cancel_text"),
    }).then(async (result) => {
      if (result.value) {
        try {
          await axiosInstance.delete(`/user/${id}`);
          const usersCopy = users.filter((user) => user.id !== id);
          setUsers(usersCopy);

          Swal.fire({
            icon: "success",
            title: translate("sw_success_title"),
            text: translate("sw_user_delete"),
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (error) {
          console.error("Error deleting user:", error);
          Swal.fire({
            icon: "error",
            title: translate("sw_all_fields_error_title"),
            text: translate("sw_user_delete_error_text"),
            showConfirmButton: true,
          });
        }
      }
    });
  };

  return (
    <div className="contain-table">
      <Table
        striped
        bordered
        hover
        responsive="sm"
        variant={theme === "oscuro" ? "dark" : "light"}
      >
        <thead>
          <tr>
            <th>No.</th>
            <th>{translate("Name")}</th>
            <th>{translate("Email")}</th>
            <th>{translate("User Type")}</th>
            <th>{translate("state")}</th>
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
                <td>
                  {user.state ? translate("active") : translate("inactive")}
                </td>
                <td className="text-center">
                  <Button
                    onClick={() => handleEdit(user.id)}
                    className="button muted-button"
                  >
                    {translate("Edit")}
                  </Button>
                </td>
                <td className="text-center">
                  <Button
                    onClick={() => handleDelete(user.id)}
                    className="button muted-button"
                    variant="danger"
                  >
                    {translate("Delete")}
                  </Button>
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
