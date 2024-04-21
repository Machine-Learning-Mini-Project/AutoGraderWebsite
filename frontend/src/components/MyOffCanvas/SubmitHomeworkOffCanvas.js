import { useState } from "react";
import { Offcanvas, Button, Form, Alert, Toast } from "react-bootstrap";
import { useFormik } from "formik";
import { BsFillCapslockFill } from "react-icons/bs";
import { fetchSubmitHomework } from "../../api/homeworkApi";

const SubmitHomeworkOffCanvas = ({ homeworkID, questions }) => {
  const formData = useState([]);

  const [show, setShow] = useState(false);
  const [toastShow, setToastShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const formik = useFormik({
    initialValues: questions.reduce((acc, question, index) => ({
      ...acc,
      [`response_${index}`]: question.type === 'code' ? null : '',
    }), {}),
    onSubmit: async (values, bag) => {
      Object.keys(values).forEach(key => {
        if (key.startsWith('response_')) {
          formData[values[key].name] = values[key];
        }
      });
      try {
        console.log(formData);
        await fetchSubmitHomework(homeworkID, formData);
        setShow(false);
        setToastShow(true);
      } catch (e) {
        bag.setErrors({ general: e.response?.data.message });
      }
    },
  });

  const handleChange = (e, index) => {
    const field = `response_${index}`;
    formik.setFieldValue(field, questions[index].type === 'code' ? e.target.files[0] : e.target.value);
  };

  return (
    <>
      <Button size="sm" onClick={handleShow}>
        <BsFillCapslockFill className="me-3" />
        Submit Homework
      </Button>

      <Offcanvas show={show} onHide={handleClose} className="w-75 h-75 mx-auto p-5" placement="top">
        <Offcanvas.Header closeButton={true}>
          <Offcanvas.Title>Homework Upload</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="mt-2">
          {formik.errors.general && <Alert variant="danger">{formik.errors.general}</Alert>}
          <Form onSubmit={formik.handleSubmit} encType="multipart/form-data">
            {questions.map((question, index) => (
              <Form.Group key={index} controlId={`response_${index}`} className="mb-3 mt-2">
                <Form.Label>
                  <strong>Question {index + 1}:</strong> {question.description}
                </Form.Label>
                {question.type === 'code' ? (
                  <Form.Control
                    onChange={(e) => handleChange(e, index)}
                    type="file"
                    name={`response_${index}`}
                    aria-label="Upload"
                  />
                ) : (
                  <Form.Control
                    onChange={(e) => handleChange(e, index)}
                    as="textarea"
                    name={`response_${index}`}
                    aria-label="Text Answer"
                  />
                )}
              </Form.Group>
            ))}
            <div className="d-grid gap-2">
              <Button type="submit" className="mt-2">
                Upload
              </Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
      <Toast onClose={() => setToastShow(false)} show={toastShow} delay={2000} autohide>
        <Toast.Header>
          <strong className="me-auto text-success">Successful</strong>
        </Toast.Header>
        <Toast.Body>Homework sent</Toast.Body>
      </Toast>
    </>
  );
};

export default SubmitHomeworkOffCanvas;
