import {
  giveNote,
  lectureNotes,
  shareYourHomework,
  downloadExcel,
} from "./assets";
import MyCard from "./Card";
import { Container, Row } from "react-bootstrap";

const CardsSection = () => {
  return (
    <Container className="p-2">
      <Row className="g-4 mt-3 mx-3" xs={1} md={2} sm={2} lg={4}>
        <MyCard
          img={lectureNotes}
          title="Collaborate"
          // text="Lorem, ipsum dolor sit amet consectetur adipisicing elit."
        />
        <MyCard
          img={shareYourHomework}
          title="Cultivate"
          // text="Lorem, ipsum dolor sit amet consectetur adipisicing elit."
        />
        <MyCard
          img={giveNote}
          title="Creative"
          // text="Lorem, ipsum dolor sit amet consectetur adipisicing elit."
        />
        <MyCard
          img={downloadExcel}
          title="Communicate"
          // text="Lorem, ipsum dolor sit amet consectetur adipisicing elit."
        />
      </Row>
    </Container>
  );
};

export default CardsSection;
