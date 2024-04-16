const asyncHandler = require("express-async-handler");
const Homework = require("../models/Homework");
const QuestionSchema = require("../models/Questions")
const Classroom = require("../models/Classroom");
const Project = require("../models/Projects");  // Ensure it's "Project", not "Projects"
const User = require("../models/User");  // Assuming there's a User model for reference
const CustomError = require("../helpers/errors/CustomError");
const excelCreater = require("../helpers/excel/excelCreater");
const path = require("path");
const fs = require('fs');  // For file handling, if necessary
const Questions = require("../models/Questions");


// Adding homework with dynamic question types
const addHomework = asyncHandler(async (req, res, next) => {
    const { deadline, questions } = req.body;
    const classroom = req.classroom;
  
    let savedQuestions = [];

    console.log("Megic");
  
    // Use a for...of loop to handle asynchronous file operations and database saves
    for (const question of questions) {

        console.log(question)


      if (question.type === 'code') {

        console.log("hello1");

        const file = question.file // Using file upload middleware like multer
        const filename = `${new Date().getTime()}_${file.name}`;
        const filePath = path.join(__dirname, '../uploads', filename);

        console.log(file, filename, filePath)

        console.log("hello2")
  
        // Async file move operation
        await new Promise((resolve, reject) => {
          file.mv(filePath, (err) => {
            if (err) {
                console.log("y",err);
              reject(err);
            } else {
                console.log("x",err);
              resolve();
            }
          });
        });
  
        console.log("File saved to:", filePath);
  
        // Create and save the question with the file path
        const dat = new Questions({
          type: question.type,
          description: question.description,
          file: filePath
        });

        const savedQuestion = await dat.save();
        savedQuestions.push(savedQuestion);
  
      } else if (question.type === 'subjective') {

        const dat = new Questions({
          type: question.type,
          description: question.description,
          answer: question.answer
        });        
        const savedQuestion = await dat.save();
        savedQuestions.push(savedQuestion);
        }
    }

  
    // Create new homework with all questions linked
    const homework = new Homework({
      endTime: deadline,
      teacher: req.user.id,
      appointedStudents: classroom.students,
      questions: savedQuestions  // Attach the saved question IDs to the homework
    });
  
    // Save the homework
    await homework.save();
  
    // Add the homework ID to the classroom and save the classroom
    classroom.homeworks.push(homework._id);
    await classroom.save();
  
    // Send the response
    res.status(200).json({ success: true, data: homework });
  });
// Submitting responses for homework questions
const submitHomework = asyncHandler(async (req, res, next) => {
  const homework = await Homework.findById(req.params.homeworkId);
  if (!homework) return next(new CustomError("Homework not found", 404));

  const { answers } = req.body;  // Expecting { questionId, answer, file (if applicable) }

  answers.forEach(answer => {
    const question = homework.questions.id(answer.questionId);
    if (!question) return next(new CustomError("Question not found", 404));

    if (question.type === 'code' && req.files && req.files[answer.questionId]) {
      const file = req.files[answer.questionId]; // Using file upload middleware like multer
      const filename = `${new Date().getTime()}_${file.originalname}`;
      const filePath = path.join(__dirname, '../uploads', filename);
      file.mv(filePath);
      question.file = filePath;
    } else if (question.type === 'subjective') {
      question.answer = answer.answer;
    }
  });

  await homework.save();
  res.status(200).json({ success: true, data: homework });
});

// Fetching detailed homework information
const getHomework = asyncHandler(async (req, res, next) => {
  const { homeworkID } = req.params;
  const homework = await Homework.findById(homeworkID)
    .populate({
      path: "submitters",
      populate: { path: "user", select: "name lastname" },
    })
    .populate({
      path: "appointedStudents",
      select: "name lastname",
    })
    .populate({
      path: "teacher",
      select: "name lastname",
    });
  if (!homework) return next(new CustomError("Homework not found", 404));
  res.status(200).json({ success: true, homework });
});

// Updating homework details
const updateHomework = asyncHandler(async (req, res, next) => {
  const homework = req.homework;
  const { title, content, endTime, questions } = req.body;

  if (title) homework.title = title;
  if (content) homework.content = content;
  if (endTime) homework.endTime = new Date(endTime);
  if (questions) homework.questions = questions; // Replacing or adding new questions

  await homework.save();
  res.status(200).json({ success: true, data: homework });
});

const rateProject = asyncHandler(async (req, res, next) => {
    const { projectID } = req.params;
    const { score } = req.body;
    if (score < 0 && score > 100) {
      return next(new CustomError("Score must be between 0 and 100", 400));
    }
  
    const project = await Project.findById(projectID);
    if (!project) return next(new CustomError("Project not found", 400));
    project.score = score;
    project.save();
    return res.status(200).json({ success: true, data: project });
  });

  const exportScores = asyncHandler(async (req, res, next) => {
    const { classroomID, homeworkID } = req.params;
    const classroom = await Classroom.findById(classroomID);
    const homework = await Homework.findById(homeworkID)
      .populate({
        path: "submitters",
        populate: { path: "user", select: "name lastname" },
      })
      .populate({
        path: "appointedStudents",
        select: "name lastname",
      });
      let projects = [];
      homework.submitters.forEach((project) => {
        let { user, score } = project;
        let data = {};
        data.name = user.name;
        data.lastname = user.lastname;
        data.score = score;
        projects.push(data);
      });
      homework.appointedStudents.forEach((student) => {
        let data = {};
        data.name = student.name;
        data.lastname = student.lastname;
        data.score = 0;
        projects.push(data);
      });
    
      const excelFile = await excelCreater(projects, classroom.accessCode);
      homework.scoreTable = excelFile;
      homework.save();
    
      const appPath = path.resolve();
      const filePath = "/public/uploads/excels";
      const myPath = path.join(appPath, filePath, excelFile);
      return res.status(200).sendFile(myPath);
    });

    const sendHomeworkFile = asyncHandler(async (req, res, next) => {
        const appPath = path.resolve();
        const filePath = "/public/uploads/homeworks";
        const { filename } = req.params;
        const myPath = path.join(appPath, filePath, filename);
        return res.status(200).sendFile(myPath);
      });
      
      const deleteHomework = asyncHandler(async (req, res, next) => {
        const classroom = req.classroom;
        const homework = req.homework;
        if (req.user.id !== homework.teacher.toString()) {
          return next(new CustomError("You are not authorized", 400));
        }
        classroom.homeworks.splice(classroom.homeworks.indexOf(homework._id), 1);
        await classroom.save();
        await homework.remove();
        return res.status(200).json({ success: true });
      });
// Additional controllers remain largely unchanged, but should be revised to ensure they handle the updated data model correctly

module.exports = {
  addHomework,
  submitHomework,
  getHomework,
  updateHomework,
  rateProject,
  exportScores,
  sendHomeworkFile,
  deleteHomework,
};
