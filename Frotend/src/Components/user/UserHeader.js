import React from "react";
import LogOut from "../logOut/LogOut";

const UserHeader = ({ setIsAdding, setIsAuthenticated }) => {
  return (
    <header>
      <h1>Users</h1>
      <div style={{ marginTop: "30px", marginBottom: "18px" }}>
        <button 
        className="btn btn-primary"
        onClick={() => setIsAdding(true)}>Add User</button>
        <LogOut setIsAuthenticated={setIsAuthenticated} 
        className="btn btn-primary"/>
      </div>
    </header>
  );
};

export default UserHeader;
