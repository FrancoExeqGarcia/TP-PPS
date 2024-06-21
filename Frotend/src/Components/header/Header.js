import React, { useContext } from "react";
import { Button, Navbar, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useAuth } from "../services/authenticationContext/authentication.context";
import ToggleTheme from "../ui/toggleTheme/ToggleTheme";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { ThemeContext } from "../services/themeContext/theme.context";
import CustomLink from "../customLink/CustomLink";
const Header = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const translate = useTranslation();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleLogoutInHeader = () => {
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
      }}
    >
      <CustomLink
        to="/home"
        className="mr-4 ms-auto me-auto border-gray rounded"
      >
        TASK MINDER
      </CustomLink>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text className="mr-4 ms-auto me-auto border-gray rounded">
          {translate("hi")} {user.UserName}!
        </Navbar.Text>
        <Dropdown align="end">
          <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
            Menu
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {user.role === "SuperAdmin" && (
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
            <Dropdown.Item onClick={handleLogoutInHeader}>
              {translate("sign_off")}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
