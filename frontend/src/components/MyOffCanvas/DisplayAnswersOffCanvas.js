import React, { useState } from 'react';
import { Offcanvas, Button, ListGroup } from 'react-bootstrap';

const DisplayAnswersOffCanvas = ({ answers, questions }) => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button size="sm" onClick={handleShow} className="mb-3">
        View Answers
      </Button>

      <Offcanvas show={show} onHide={handleClose} className="w-75 h-75 mx-auto p-5" placement="top">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Answers Review</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {answers.map((answer, index) => (
            <ListGroup key={index} className="mb-4">
              <ListGroup.Item><strong>Question:</strong> {questions[index]?.description}</ListGroup.Item>
              <ListGroup.Item><strong>Answer:</strong> {answer.type === 'code' ? 'Code file attached' : answer.answer}</ListGroup.Item>
              <ListGroup.Item><strong>Score:</strong> {answer.points + " / " + questions[index]?.score}</ListGroup.Item>
              <ListGroup.Item><strong>Feedback:</strong> {answer.feedback}</ListGroup.Item>
              <ListGroup.Item><strong>Plagiarism Detected:</strong> {answer.plag ? answer.plag.probability : 'No'}</ListGroup.Item>
            </ListGroup>
          ))}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default DisplayAnswersOffCanvas;
