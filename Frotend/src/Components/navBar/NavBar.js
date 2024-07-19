import React, { useContext, useState } from "react";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { useAuth } from "../../services/authenticationContext/authentication.context";
import { useNavigate } from "react-router";
import { ThemeContext } from "../../services/themeContext/theme.context";
import { Dropdown, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import ComboLanguage from "../ui/comboLanguage/ComboLanguaje";
import { FaCheckDouble } from "react-icons/fa"; // Asegúrate de importar el icono

function NavBar() {
  const navigate = useNavigate();
  const translate = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [animate, setAnimate] = useState(false);

  const handleLogoutInDashboard = () => {
    logout();
    navigate("/login");
  };

  const handleCreateUser = () => {
    navigate("/Users");
  };
  const handleSearchProject = () => {
    navigate("/projects");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleSearchTodos = () => {
    navigate("/todos");
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleIconClick = () => {
    setAnimate(true);
    setTimeout(() => setAnimate(false), 300); // Duración de la animación
  };

  return (
    <Navbar
      variant={theme === "oscuro" ? "dark" : "light"}
      className="d-flex align-items-center"
      style={{
        borderBottom: `2px solid ${theme === "oscuro" ? "white" : "black"}`,
        backgroundColor: theme === "oscuro" ? "#333" : "#f8f9fa",
        color: theme === "oscuro" ? "white" : "black",
      }}
      expand="lg"
    >
      <Link
        to="/home"
        className="navbar-brand-container"
        style={{ textDecoration: "none" }}
      >
        <Navbar.Brand
          className="d-flex align-items-center"
          style={{
            color: theme === "oscuro" ? "white" : "black",
            cursor: "pointer",
            fontSize: "1.5rem", // Ajusta el tamaño del texto según sea necesario
          }}
        >
          TASK MANAGER
          <FaCheckDouble
            onClick={handleIconClick}
            style={{
              color: "#4c1c8c", // Color personalizado del icono
              marginRight: "8px", // Espaciado entre el icono y el texto
              transition: "transform 0.3s",
              transform: animate ? "scale(1.2)" : "scale(1)", // Animación de escala
            }}
          />
        </Navbar.Brand>
      </Link>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
        <Navbar.Text
          style={{
            padding: "10px",
            border: `2px solid ${theme === "oscuro" ? "white" : "black"}`,
            backgroundColor: theme === "oscuro" ? "#333" : "#f8f9fa",
            color: theme === "oscuro" ? "white" : "black",
          }}
          className="mr-4 ms-auto me-auto border-gray rounded font-weight-bold"
        >
          {translate("hi")} {user.UserName}!
        </Navbar.Text>
        <ComboLanguage style={{ marginRight: "16px" }} />
        <Dropdown align="end">
          <Dropdown.Toggle variant="primary" id="dropdown-basic">
            Menu
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {user.UserType === "SuperAdmin" && (
              <Dropdown.Item onClick={handleCreateUser}>
                {translate("Users")}
              </Dropdown.Item>
            )}
            {user.UserType === "SuperAdmin" && (
              <Dropdown.Item onClick={handleSearchProject}>
                {translate("Projects")}
              </Dropdown.Item>
            )}
            <Dropdown.Item onClick={handleProfile}>
              {translate("Profile")}
            </Dropdown.Item>
            <Dropdown.Item onClick={handleSearchTodos}>
              {translate("my_todos")}
            </Dropdown.Item>
            <Dropdown.Item onClick={handleThemeToggle}>
              {theme === "oscuro"
                ? translate("light_theme_change")
                : translate("dark_theme_change")}
            </Dropdown.Item>
            <Dropdown.Item onClick={handleLogoutInDashboard}>
              {translate("sign_off")}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavBar;
