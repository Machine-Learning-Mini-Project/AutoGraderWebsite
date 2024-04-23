import React, { useContext, useEffect, useState } from "react";
import { Button, Col, Container, Row, Spinner, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { FaDownload } from "react-icons/fa";
import { SiMicrosoftexcel } from "react-icons/si";
import moment from "moment";
import { saveAs } from "file-saver";
import RateProjectOffCanvas from "../../components/MyOffCanvas/RateProjectOffCanvas";
import { AuthContext } from "../../contexts/authContext";
import {
  fetchDownloadExcelFile,
  fetchDownloadHomeworkFile,
  fetchHomeworkDetail,
} from "../../api/homeworkApi";
import DisplayAnswersOffCanvas from "../../components/MyOffCanvas/DisplayAnswersOffCanvas";

import { fetchUser } from "../../api/authApi";

const HomeworkPage = () => {
  const { homeworkID } = useParams();
  const [homework, setHomework] = useState({});
  const [users, setUsers] = useState([])
  const [show, setShow] = useState(false);
  const [lock, setLock] = useState(false);
  const { classroom } = useContext(AuthContext);
  const [plagResults, setPlagResults] = useState([]);

  useEffect(() => {console.log(homework)}, [])

  const getScore = (arr) => {
    let score = 0;

    for(let i = 0; i < arr.length; i++) {
        if(arr[i].points) score += arr[i].points;
    }

    return score;
  }

  // useEffect(() => {
  //   console.log(users);
  // }, [users])

  useEffect(() => {

    const printDetails = async (userID) => {
        const { data } = await fetchUser(userID);
        const isUserPresent = users.some(existingUser => existingUser._id === data.user._id);

        if (!isUserPresent) {
            setUsers(prevUsers => [...prevUsers, data.user]); // Use functional form of setUsers
        } else {
            console.log("User is already present in the array.");
        }

       
    };

    const getHomeworkDetail = async () => {
        const { data } = await fetchHomeworkDetail(homeworkID);

        for (let i = 0; i < data.homework.appointedStudents.length; i++) {
            await printDetails(data.homework.appointedStudents[i].student);
        }

        setHomework(data.homework);
    };
    
    getHomeworkDetail();
}, [homeworkID, show]);

  const downloadFile = async (filename) => {
    try {
      const response = await fetchDownloadHomeworkFile(filename);
      const blob = await response.blob();
      saveAs(blob, filename);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const downloadExcelFile = async (homeworkID) => {
    setLock(true);
    try {
        console.log("hmm", classroom);
      const response = await fetchDownloadExcelFile(classroom._id, homeworkID);
      const blob = await response.blob();
      saveAs(blob, "StudentGrades.xlsx");
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setLock(false);
    }
  };

  const checkForPlag = async (homeworkID) => {

  };

  return (
    <Container className="mt-4">
      {/* header */}
      <Row>
        <Col>
          <h1>{homework?.title}</h1>
        </Col>
        <Col className="text-end">
          Deadline: {moment(homework.endTime).format("DD.MM.YYYY")}
          <br />
          <Button
            size="sm"
            variant="success"
            onClick={() => downloadExcelFile(homeworkID)}
            disabled={lock}
          >
            {lock ? (
              <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" className="me-2" />
            ) : (
              <SiMicrosoftexcel className="me-2" /> 
            )}
            Download student grades
          </Button>
        </Col>
      </Row>
      <hr className="bg-danger" />
      {/* body */}
      <p className="lead">{homework?.content}</p>

      <h4>Student Submissions</h4>

      {homework && homework?.appointedStudents?.length > 0 && (
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Lastname</th>
              <th>Submission</th>
              <th>Score</th>
              <th>Rate</th>
              <th>Answers</th>
              <th>Plagiarism Probability</th>
            </tr>
          </thead>
          <tbody>
            {homework?.appointedStudents && homework?.appointedStudents?.map((submitter, index) => (
              <tr key={submitter._id}>
                <td>{users.length > index && users[index].name}</td>
                <td>{users.length > index && users[index].lastname}</td>
                <td>
                  <Button size="sm" variant="secondary" onClick={() => downloadFile(submitter?.file)}>
                    <FaDownload />
                  </Button>
                </td>
                <td>{getScore(submitter.answers)}</td>
                <td>
                  <RateProjectOffCanvas
                    name={users[index].name}
                    lastname={users[index].lastname}
                    projectID={submitter?._id}
                    show={show}
                    setShow={setShow}
                  />
                </td>
                <td>
                    <DisplayAnswersOffCanvas answers = {submitter.answers} questions = {homework.questions}/>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <hr/>

      <h4>Students</h4>


      {homework?.appointedStudents?.length > 0 && (
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Lastname</th>
            </tr>
          </thead>
          <tbody>
            {homework.appointedStudents.map((student, index) => (
              <tr key={student._id}>
                <td>{users.length > index && users[index].name}</td>
                <td>{users.length > index && users[index].lastname}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Button size="sm" variant="secondary" onClick={() => checkForPlag()}>
        Check for Plagiarism
      </Button>
      {plagResults?.length > 0 && (
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Lastname</th>
            </tr>
          </thead>
          <tbody>
            {plagResults.map((student, index) => (
              <tr key={student._id}>
                <td>{users.length > index && users[index].name}</td>
                <td>{users.length > index && users[index].lastname}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default HomeworkPage;
