import React, { useState, useContext } from 'react';
import { Button, Form, Accordion, InputGroup, FormControl } from 'react-bootstrap';
import { useFormik } from 'formik';
import { fetchCreateHomework } from '../../api/homeworkApi';
import { AuthContext } from "../../contexts/authContext";

const CreateHomework = () => {
    const [questions, setQuestions] = useState([]);
    const { classroom } = useContext(AuthContext);

    const formik = useFormik({
        initialValues: {
            title: '',
            deadline: '',
        },
        onSubmit: async (values, { setSubmitting, resetForm, setErrors }) => {
            setSubmitting(true);
            
            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("deadline", values.deadline);
            formData.append("questions", JSON.stringify(questions));

            for (let i = 0; i < questions.length; i++) {
                if (questions[i].file !== undefined)
                    formData.append(`codeFile${i}`, questions[i].file);
            }

            try {
                const response = await fetchCreateHomework(classroom._id, formData);
                resetForm();
                setQuestions([]);
                alert("Homework added successfully");
            } catch (error) {
                console.error("Failed to submit homework:", error);
                setErrors({ submit: "Failed to create homework. Please try again." });
            }

            setSubmitting(false);
        },
    });

    const addQuestion = (type) => {
        const newQuestion = { 
            type, 
            description: '', 
            file: null, 
            score: '', 
            instruction: ''
        };
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
                    <Form onSubmit={formik.handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Homework Title</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                onChange={formik.handleChange}
                                placeholder="Enter Homework Title"
                            />
                        </Form.Group>

                        <Button variant="primary" onClick={() => addQuestion("code")}>
                            Add Code Question
                        </Button>
                        <Button className="mx-2" variant="primary" onClick={() => addQuestion("subjective")}>
                            Add Subjective Question
                        </Button>

                        <hr/>

                        {questions.map((question, index) => (
                            <div key={index} className="my-3">
                                <h4 className='py-2'>Question #{index + 1}</h4>
                                <InputGroup>
                                    <FormControl
                                        placeholder="Question Description"
                                        value={question.description}
                                        onChange={(e) => handleQuestionChange(e.target.value, index, "description")}
                                    />
                                </InputGroup>
                                {question.type === "code" ? (
                                    <FormControl
                                        className="my-2"
                                        type="file"
                                        onChange={(e) => handleQuestionChange(e.target.files[0], index, "file")}
                                    />
                                ) : (
                                    <FormControl
                                        className="my-2"
                                        as="textarea"
                                        placeholder="Write the expected answer here"
                                        onChange={(e) => handleQuestionChange(e.target.value, index, "answer")}
                                    />
                                )}
                                <InputGroup className="my-2">
                                    <FormControl
                                        type="text"
                                        placeholder="Instruction"
                                        value={question.instruction}
                                        onChange={(e) => handleQuestionChange(e.target.value, index, "instruction")}
                                    />
                                </InputGroup>
                                <InputGroup>
                                    <FormControl
                                        type="number"
                                        placeholder="Score"
                                        value={question.score}
                                        onChange={(e) => handleQuestionChange(e.target.value, index, "score")}
                                    />
                                </InputGroup>
                                <hr/>
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
