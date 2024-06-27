import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ToggleTheme from "../ui/toggleTheme/ToggleTheme";
import ComboLanguage from "../ui/comboLanguage/ComboLanguaje";
import { ThemeContext } from "../../services/themeContext/theme.context";
import useTranslation from "../../custom/useTranslation/useTranslation";
import { useAuth } from "../../services/authenticationContext/authentication.context";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";

const LogIn = () => {
  const { theme } = useContext(ThemeContext);
  const { login } = useAuth();
  const navigate = useNavigate();
  const translate = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const emailChangeHandler = (event) => {
    setEmail(event.target.value);
  };

  const passwordChangeHandler = (event) => {
    setPassword(event.target.value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await login(email, password);
      navigate("/home");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Error logging in:", error);
      Swal.fire({
        icon: "error",
        title: translate("error"),
        text: translate("wrong_email_or_password"),
        confirmButtonText: translate("ok"),
      });
    }
  };

  return (
    <Container fluid className="login-container">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={6} lg={4}>
          <div
            className={`p-4 rounded shadow ${
              theme === "DARK" ? "bg-dark text-light" : "bg-light"
            }`}
          >
            <ComboLanguage />
            <h3 className="mb-4 text-center">{translate("welcome")}</h3>
            <Form onSubmit={handleLogin}>
              <Form.Group controlId="formBasicEmail" className="mb-3">
                <Form.Control
                  type="email"
                  placeholder={translate("email")}
                  onChange={emailChangeHandler}
                  value={email}
                />
              </Form.Group>

              <Form.Group controlId="formBasicPassword" className="mb-3">
                <Form.Control
                  type="password"
                  placeholder={translate("password")}
                  onChange={passwordChangeHandler}
                  value={password}
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100">
                {translate("login")}
              </Button>
            </Form>
            <div className="mt-3 text-center">
              <ToggleTheme />
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LogIn;
