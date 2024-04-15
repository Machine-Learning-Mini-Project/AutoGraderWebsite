import React from "react";
import { Button, Col, Container, Image, Row } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { mainSvg } from "./assets";

const MainSection = () => {
  return (
    <section className="bg-light p-5">
      <Container>
        <Row className="justify-content-center align-items-center">
          <Col className="text-center me-5">
            <h2 className="mb-5">
              Somaiya Classroom making Lab work and Submissions seamless
            </h2>
            {/* <p className="lead">
              <span className="text-primary fw-bold">Somaiya Classroom</span> is a
              one-stop shop for all things education and learning. With our
              easy-to-use and secure tool, instructors manage, measure and
              enrich their learning experience.
            </p> */}
           
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
