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
    }
  });

const Questions = mongoose.model("Question", QuestionSchema);

module.exports = Questions;