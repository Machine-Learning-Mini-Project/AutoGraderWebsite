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

const HomeworkPage = () => {
  const { homeworkID } = useParams();
  const [homework, setHomework] = useState({});
  const [show, setShow] = useState(false);
  const [lock, setLock] = useState(false);
  const { classroom } = useContext(AuthContext);

  useEffect(() => {console.log(homework)}, [])

  useEffect(() => {
    const getHomeworkDetail = async () => {
      const { data } = await fetchHomeworkDetail(homeworkID);
      setHomework({ ...data.homework });
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
      const response = await fetchDownloadExcelFile(classroom._id, homeworkID);
      const blob = await response.blob();
      saveAs(blob, "StudentGrades.xlsx");
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setLock(false);
    }
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

      {homework && homework?.submitters && homework?.submitters?.length > 0 && (
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Lastname</th>
              <th>Project</th>
              <th>Score</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            {homework?.submitters && homework?.submitters?.map((submitter) => (
              <tr key={submitter._id}>
                <td>{submitter.user.name}</td>
                <td>{submitter.user.lastname}</td>
                <td>
                  <Button size="sm" variant="secondary" onClick={() => downloadFile(submitter.file)}>
                    <FaDownload />
                  </Button>
                </td>
                <td>{submitter?.score || "-"}</td>
                <td>
                  <RateProjectOffCanvas
                    name={submitter?.user.name}
                    lastname={submitter?.user.lastname}
                    projectID={submitter?._id}
                    show={show}
                    setShow={setShow}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {homework?.appointedStudents?.length > 0 && (
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Lastname</th>
            </tr>
          </thead>
          <tbody>
            {homework.appointedStudents.map((student) => (
              <tr key={student._id}>
                <td>{student.name}</td>
                <td>{student.lastname}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default HomeworkPage;
