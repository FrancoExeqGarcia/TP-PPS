import React from "react";
import Table from 'react-bootstrap/Table';
import useTranslation from "../../custom/useTranslation/useTranslation";

const ToDoTable = ({ todos, handleEdit, handleDelete, users }) => {

  const translate = useTranslation();
  const getUserEmailById = (id) => {
    const user = users.find((user) => user.id === id);
    return user ? user.email : "Unassigned";
  };

  return (
    <div className="contain-table">
      <Table striped bordered hover responsive="sm">
        <thead>
          <tr>
            <th>No.</th>
            <th>{translate("Name")}</th>
            <th>{translate("Start Date")}</th>
            <th>{translate("End Date")}</th>
            <th>{translate("State")}</th>
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
                <td>{i + 1}</td>
                <td>{todo.name}</td>
                <td>{todo.startDate}</td>
                <td>{todo.endDate}</td>
                <td>{todo.state ? "Active" : "Inactive"}</td>
                <td>{todo.isCompleted ? "Yes" : "No"}</td>
                <td>{getUserEmailById(todo.assignedUserId)}</td>
                <td className="text-right">
                  <button
                    onClick={() => handleEdit(todo.id)}
                    className="btn btn-primary"
                  >
                    {translate("Edit")}
                  </button>
                </td>
                <td className="text-left">
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="btn btn-primary"
                  >
                    {translate("Delete")}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9}>{translate("There are not assigned ToDos")}</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ToDoTable;
