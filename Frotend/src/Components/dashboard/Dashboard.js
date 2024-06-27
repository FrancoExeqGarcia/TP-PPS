import React from "react";
import { Col, Container, Row } from "react-bootstrap";

import ComboLanguage from "../ui/comboLanguage/ComboLanguaje";
import ChatBotManager from "../chatBotManager/ChatBotManager";
import ProjectDashboard from "../projects/Projects";
import NavBar from "../navBar/NavBar";

const Dashboard = () => {
  return (
    <Container fluid>
      <NavBar />
      <ComboLanguage />
      <Row className="mt-4">
        <Col xs={12} className="text-center">
          <h2>Proyectos</h2>
        </Col>
        <Col xs={12} className="mt-2">
          <ProjectDashboard />
        </Col>
      </Row>
      <Row className="mt-4">
        <Col xs={12}>
          <ChatBotManager />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
