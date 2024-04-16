import React, { useState, useEffect, useContext } from 'react';
import { Button, Form, Accordion, InputGroup, FormControl } from 'react-bootstrap';
import { useFormik } from 'formik';
import { fetchCreateHomework } from '../../api/homeworkApi';
import { fetchClassroomDetail } from "../../api/classroomApi";
import { AuthContext } from "../../contexts/authContext";


const CreateHomework = () => {
    
    const [questions, setQuestions] = useState([]);
    
    const { classroom, setClassroom } = useContext(AuthContext);


    useEffect(() => {
        console.log(questions)
    }, [questions])
 
    const formik = useFormik({
      initialValues: {
        deadline: '',
      },
      onSubmit: async (values, { setSubmitting, resetForm, setErrors }) => {
        setSubmitting(true);
        
        // Prepare the data for submission
        const homeworkData = {
          deadline: values.deadline,
          questions: questions
        };
      
        try {
          // Mock API call to send homework data
          // You should replace this with the actual API call
          console.log("Submitting Homework:", homeworkData);
          const response = await fetchCreateHomework(classroom._id,homeworkData); // Uncomment and use your API service call
      
          resetForm();  // Reset the form after successful submission
          setQuestions([]);  // Clear questions after submission
          alert("Homework added successfully");  // Provide a success message to the user
        } catch (error) {
          console.error("Failed to submit homework:", error);
          setErrors({ submit: "Failed to create homework. Please try again." });
        }
      
        setSubmitting(false);  // Reset submitting state
      },      
    });
  
    const addQuestion = (type) => {
      const newQuestion = { type, description: '', file: null };
      setQuestions([...questions, newQuestion]);
    };
  
    const handleQuestionChange = (value, index, field) => {
      const updatedQuestions = questions.map((question, i) => {
        if (i === index) {
          return { ...question, [field]: value };
        }
        return question;
      });
      setQuestions(updatedQuestions);
    };

    return (
        <Accordion defaultActiveKey={0} className="mt-3">
            <Accordion.Item eventKey="0">
                <Accordion.Header>Create Homework</Accordion.Header>
                <Accordion.Body>
                    {/* Form */}
                    <Form onSubmit={formik.handleSubmit}>
                        <Button
                            variant="primary"
                            onClick={() => addQuestion("code")}
                        >
                            Add Code Question
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => addQuestion("subjective")}
                        >
                            Add Subjective Question
                        </Button>

                        {questions.map((question, index) => (
                            <div key={index} className="my-3">
                                <InputGroup>
                                    <FormControl
                                        placeholder="Question Description"
                                        value={question.description}
                                        onChange={(e) =>
                                            handleQuestionChange(
                                                e.target.value,
                                                index,
                                                "description"
                                            )
                                        }
                                    />
                                </InputGroup>
                                {question.type === "code" ? (
                                    <FormControl
                                        type="file"
                                        onChange={(e) =>
                                            handleQuestionChange(
                                                e.target.files[0],
                                                index,
                                                "file"
                                            )
                                        }
                                    />
                                ) : (
                                    <FormControl
                                        as="textarea"
                                        placeholder="Write the question here"
                                        onChange={(e) =>
                                            handleQuestionChange(
                                                e.target.value,
                                                index,
                                                "answer"
                                            )
                                        }
                                    />
                                )}
                            </div>
                        ))}

                        <Form.Group className="mb-3">
                            <Form.Label>Deadline</Form.Label>
                            <Form.Control
                                type="date"
                                name="deadline"
                                onChange={formik.handleChange}
                            />
                        </Form.Group>

                        <Button type="submit">Add Homework</Button>
                    </Form>
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    );
};

export default CreateHomework;
