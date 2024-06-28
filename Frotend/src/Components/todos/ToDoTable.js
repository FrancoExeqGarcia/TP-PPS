import React from "react";
import Table from 'react-bootstrap/Table';

const ToDoTable = ({ todos, handleEdit, handleDelete, users }) => {
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
            <th>Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>State</th>
            <th>Is Completed</th>
            <th>Assigned User</th>
            <th colSpan={2} className="text-center">
              Actions
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
                    Edit
                  </button>
                </td>
                <td className="text-left">
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="btn btn-primary"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9}>No ToDos</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ToDoTable;
