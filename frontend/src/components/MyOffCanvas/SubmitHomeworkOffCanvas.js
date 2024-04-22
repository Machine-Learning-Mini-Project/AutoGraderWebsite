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
      questions: questions
    }), {}),

    onSubmit: async (values, { setSubmitting, resetForm, setErrors }) => {
            // setSubmitting(true);

            console.log(values)

            const formData = new FormData();
            formData.append("questions", JSON.stringify(values.questions));

            console.log(formData)

            for (let i = 0; i < values.questions.length; i++) {
                if (values.questions[i].file !== undefined)
                    formData.append(`codeFile${values.questions[i]._id}`, values.questions[i].file);
            }

            try {
                const response = await fetchSubmitHomework(homeworkID, formData);
                resetForm();
                setShow(false);
                setToastShow(true);
                alert("Homework added successfully");
            } catch (error) {
                console.error("Failed to submit homework:", error);
                setErrors({ submit: "Failed to submit homework. Please try again." });
            }
    }
  });

  const handleChange = (e, index) => {
    const field = `questions.${index}.answer`;
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
                    name={`${question._id}`}
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
