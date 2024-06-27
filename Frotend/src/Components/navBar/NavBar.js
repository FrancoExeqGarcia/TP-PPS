import React, { useContext } from "react";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { useAuth } from "../../services/authenticationContext/authentication.context";
import { useNavigate } from "react-router";
import { ThemeContext } from "../../services/themeContext/theme.context";
import { Dropdown, Navbar } from "react-bootstrap";

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
      <Navbar.Brand className="mr-4 ms-auto me-auto border-black rounded p-6 text-black">
        TASK MINDER
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text className="mr-4 ms-auto me-auto border-gray rounded font-weight-bold">
          {translate("hi")} {user.UserName}!
        </Navbar.Text>
        <Dropdown align="end">
          <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
            Menu
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {user.UserType === "SuperAdmin" && (
              <Dropdown.Item onClick={handleCreateUser}>
                {translate("users")}
              </Dropdown.Item>
            )}
            <Dropdown.Item onClick={handleProfile}>
              {translate("profile")}
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
