const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
  type: {
    type: String,
    enum: ['code', 'subjective'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  file: {
    type: String, // Path to the file or identifier
    required: function() { return this.type === 'code'; } // Conditional required based on question type
  },
  answer: {
    type: String,
    required: function() { return this.type === 'subjective'; } // Conditional required based on question type
  },
  score: {
    type: Number,
    required: true
  } , 
  instruction: {
    type: String, 
    required: true
  }
});

const HomeworkSchema = new Schema({
    title: String,
  content: String,
  endTime: {
    type: Date,
    required: true
  },
  teacher: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true
  },
  questions: [QuestionSchema], // Array of questions
  appointedStudents: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    }
  ],
  scoreTable: String, // This might need to be more structured depending on how scores are tracked
});

const Homework = mongoose.model("Homework", HomeworkSchema);

module.exports = Homework;