import React, { useContext } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { ThemeContext } from "../../services/themeContext/theme.context";
import { useAuth } from "../../services/authenticationContext/authentication.context";

const ToDoTable = ({ todos, handleEdit, handleDelete, users }) => {
  const translate = useTranslation();
  const { theme } = useContext(ThemeContext);
  const { user } = useAuth();

  const getUserEmailById = (id) => {
    const user = users.find((user) => user.id === id);
    return user ? user.email : "Unassigned";
  };

  return (
    <div>
      <Table striped bordered hover responsive="sm" variant={theme === "oscuro" ? "dark" : "light"}>
        <thead>
          <tr>
            <th>No.</th>
            <th>{translate("Name")}</th>
            <th>{translate("Start Date")}</th>
            <th>{translate("End Date")}</th>
            <th>{translate("Is Completed")}</th>
            <th>{translate("Assigned User")}</th>
            <th colSpan={2} className="text-center">
            {translate("Actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {todos.length > 0 ? (
            todos.map((todo, i) => (
              <tr key={todo.id}>
                <td>{todo.id}</td>
                <td>{todo.name}</td>
                <td>{todo.startDate}</td>
                <td>{todo.endDate}</td>
                <td>{todo.isCompleted ? "Yes" : "No"}</td>
                <td>{getUserEmailById(todo.assignedUserId)}</td>
                <td className="text-center">
                  <Button
                    onClick={() => handleEdit(todo.id)}
                    variant="primary"
                    className="item-center"
                    disabled={user.UserType!=="SuperAdmin" && user.UserType!=="Admin" && todo.assignedUserId != user.UserId}
                  >
                     {translate("Edit")}
                  </Button>
                </td>
                <td className="text-center">
                  <Button
                    onClick={() => handleDelete(todo.id)}
                    variant="danger"
                    disabled={user.UserType!=="SuperAdmin" && user.UserType!=="Admin" && todo.assignedUserId != user.UserId}
                  >
                    {translate("Delete")}
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="text-center">
                {translate("No ToDos")}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ToDoTable;
