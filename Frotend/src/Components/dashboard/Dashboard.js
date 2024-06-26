import React, { useContext } from "react";
import { Col, Container, Navbar, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useAuth } from "../services/authenticationContext/authentication.context";
import ComboLanguage from "../ui/comboLanguage/ComboLanguaje";
import useTranslation from "../../custom/useTranslation/useTranslation";
import Projects from "../projects/Projects";
import { ThemeContext } from "../services/themeContext/theme.context";
import User from "../user/User";
import ChatBotManager from "../chatBotManager/ChatBotManager";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const translate = useTranslation();
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
    <Container fluid className={theme === "oscuro" ? "dark-theme" : ""}>
      <Navbar
        variant={theme === "oscuro" ? "dark" : "light"}
        className="d-flex align-items-center"
        style={{
          borderBottom: `2px solid ${theme === "oscuro" ? "white" : "black"}`,
        }}
      >
        <Navbar.Brand className="mr-4 ms-auto me-auto border-gray rounded">
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
      <ComboLanguage />
      <Col xs={12} className="text-center mt-4">
        {(user.UserType === "SuperAdmin" || user.UserType === "Admin") && (
          <User />
        )}
      </Col>
      <Col xs={12} className="text-center mt-4">
        <Projects />
      </Col>
      <ChatBotManager user={user} />
    </Container>
  );
};

export default Dashboard;
