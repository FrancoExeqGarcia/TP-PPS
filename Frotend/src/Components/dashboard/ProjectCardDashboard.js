import React from "react";
import { Col, Container, Row } from "react-bootstrap";

import ComboLanguage from "../ui/comboLanguage/ComboLanguaje";
import ChatBotManager from "../chatBotManager/ChatBotManager";
import ProjectDashboard from "../projects/ProjectDashboard";
import NavBar from "../navBar/NavBar";
import ToDoDashboard from "../todos/ToDoDashboard";

const Dashboard = () => {
  return (
    <Container fluid>
      <NavBar />
      <ComboLanguage />
      <Row className="mt-4">
        <Col sm className="text-center">
          <h2>Proyectos</h2>
        </Col>
        </Row>
        <Row className="mt-4">  
        <Col sm className="mt-2">
          <ProjectDashboard />
        </Col>
      </Row>
      <Row className="mt-4">
        <Col sm className="text-center">
          <h2>Tareas</h2>
        </Col>
        </Row>
        <Row className="mt-4">  
        <Col sm className="mt-2">
          <ToDoDashboard />
        </Col>
      </Row>
      <Row className="mt-4">
        <Col sm>
          <ChatBotManager />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
