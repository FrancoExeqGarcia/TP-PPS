import React, { useContext } from "react";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { useAuth } from "../../services/authenticationContext/authentication.context";
import { useNavigate } from "react-router";
import { ThemeContext } from "../../services/themeContext/theme.context";
import { Dropdown, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";

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
    >
      <Link to="/home"className="navbar-brand-container">
        <Navbar.Brand className="navbar-brand-custom mr-4 ms-auto me-auto border-black rounded p-6 text-black">
          TASK MANAGER
        </Navbar.Brand>
      </Link>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text className="mr-4 ms-auto me-auto border-gray rounded font-weight-bold">
          {translate("hi")} {localStorage.getItem("Name")}!
        </Navbar.Text>
        <Dropdown align="end">
          <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
            Menu
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {user.UserType === "SuperAdmin" && (
              <Dropdown.Item onClick={handleCreateUser}>
                {translate("Users")}
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
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavBar;
