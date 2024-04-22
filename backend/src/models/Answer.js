const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
    type: {
      type: String,
      enum: ['code', 'subjective'],
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
    questionId: {
      type: mongoose.Types.ObjectId,
      ref: "Question",
    },
    points:{
      type: Number,
      required: false
    },
    feedback:{
      type: String,
      required: false
    }
  });


const Answer = mongoose.model("Answer", AnswerSchema);

module.exports = Answer;