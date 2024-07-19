import React, { useContext } from "react";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { useAuth } from "../../services/authenticationContext/authentication.context";
import { useNavigate } from "react-router";
import { ThemeContext } from "../../services/themeContext/theme.context";
import { Dropdown, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import ComboLanguage from "../ui/comboLanguage/ComboLanguaje";

function NavBar() {
  const navigate = useNavigate();
  const translate = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);

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

  const handleThemeToggle = () => {
    toggleTheme();
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
      <Link to="/home" className="navbar-brand-container">
        <Navbar.Brand className="navbar-brand-custom mr-4 ms-auto me-auto border-black rounded p-6 text-black">
          TASK MANAGER
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
        <Dropdown align="end" className="me-2">
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
        <ComboLanguage />
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavBar;
