import React from "react";
import { Button, Col, Container, Image, Row } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { mainSvg } from "./assets";

const MainSection = () => {
  return (
    <section className="bg-light p-5">
      <Container>
        <Row className="justify-content-center align-items-center">
          <Col className="text-center me-md-5">
            <h2 className="mb-5">
              Somaiya Classrooms
            </h2>
            <p className="lead">
              Welcome to the future of education, where Somaiya Classrooms revolutionizes the way you learn and collaborate. Gone are the days of cumbersome lab work and manual submissions. With our cutting-edge platform, we seamlessly automate every step of the process, freeing you to focus on what truly matters - your education.
            </p>
          </Col>
          <Col className="d-none d-md-block">
            <Image fluid src={mainSvg} alt="Online Education | Classroom App" />
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default MainSection;
