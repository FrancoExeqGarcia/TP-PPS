import React, { useState } from 'react';
import './EditUser.css'; 

const EditUser = () => {
  const [editField, setEditField] = useState(null);

  const handleFieldSelection = (field) => {
    setEditField(field);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="edit-user-title">Edit User</h2>
        {editField === null ? (
          <div className="field-selection">
            <p>Seleccione la opción que desea editar:</p>
            <button className="signin-button" onClick={() => handleFieldSelection('username')}>
              Nombre de usuario
            </button>
            <button className="signin-button" onClick={() => handleFieldSelection('email')}>
              Correo
            </button>
            <button className="signin-button" onClick={() => handleFieldSelection('password')}>
              Contraseña
            </button>
          </div>
        ) : (
          <div className="edit-field">
            <p>Edit {editField}:</p>
            <input
              type={editField === 'password' ? 'password' : 'text'}
              placeholder={`Enter new ${editField}`}
              className="input-control"
            />
            <button className="signin-button">Guardar cambios</button>
          </div>
        )}
        <br></br>
         <button className="return-button">Volver al inicio</button>
      </div>
    </div>
  );
};

export default EditUser;
