import React from "react";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import useTranslation from "../../custom/useTranslation/useTranslation";

function NavBar() {
  const translate = useTranslation();
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">Task Minder</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <ul className="navbar-nav ml-auto text-right">
            {" "}
            {}
            <li className="nav-item">
              <Button variant="secondary" href="/iniciar-sesion">
              {translate("login")}
              </Button>
            </li>
            <li className="nav-item">
              <Button variant="success" href="/registrarse">
              {translate("register")}
              </Button>
            </li>
          </ul>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
