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
const Answer = require("../models/Answer");
const { verify } = require("jsonwebtoken");
const axios = require("axios")
const FormData = require('form-data');




// Adding homework with dynamic question types
const addHomework = asyncHandler(async (req, res, next) => {
    let { deadline, questions, title } = req.body;
    const classroom = req.classroom;
    questions = JSON.parse(questions)
  
    let savedQuestions = [];

    // console.log(questions)
    // console.log("megic")
  
    // Use a for...of loop to handle asynchronous file operations and database saves

    const files = req.files // Using file upload middleware like multer

    const filenames = files.map((file, ind) => {
      return `${new Date().getTime()}_${file.originalname}`;
    });

    const filepaths = filenames.map((filename, ind) => {
      return path.join(__dirname, '../../public/uploads/homeworks', filename);;
    });
    
    for (let i=0; i<files.length; i++){
      try {
          await new Promise((resolve, reject) => {
              fs.rename(files[i].path, filepaths[i], (err) => {
                  if (err) {
                      reject(err);
                  } else {
                      console.log(`File ${files[i].originalname} successfully renamed.`);
                      resolve();
                  }
              });
          });
      } catch (error) {
          console.error(`Error renaming file ${files[i].originalname}:`, error);
      }
    }


    // console.log("File saved to:", filePath);

    // Create and save the question with the file path
    let i1 = 0;
    questions.forEach((question) => {
      if(question.type == 'code'){
        const dat = new Questions({
          type: question.type,
          description: question.description,
          file: filepaths[i1],
          score: question.score, 
          instruction: question.instruction
        });
        i1 += 1;
        savedQuestions.push(dat);
      }
    });




    console.log("here")

    questions.forEach((question) => {
      if (question.type === 'subjective') {
        const dat = new Questions({
          type: question.type,
          description: question.description,
          answer: question.answer,
          score: question.score, 
          instruction: question.instruction
        });        
        savedQuestions.push(dat);
      }
    });    
    
  
    // Create new homework with all questions linked
    const homework = new Homework({
      title: title, 
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

    let { questions } = req.body;  

    // console.log("xx",req.params)

    questions = JSON.parse(questions)


    // console.log("Woww", questions)
    // console.log(req.files)

    const homework = await Homework.findById(req.params.homeworkID);
    if (!homework) return next(new CustomError("Homework not found", 404));


    const files = req.files;  // Assuming files are uploaded with keys matching question IDs if type is 'code'
    let updates = [];
    let answers = [];

    for (const question of questions) {

        // question = json.pa

        if (question.type === 'code' && files) {
            const file = files[0];
            const filename = `${new Date().getTime()}_${file.originalname}`;
            const filePath = path.join(__dirname, '../../public/uploads/homeworks', filename);

            console.log(filename, filePath)

            try {
                await new Promise((resolve, reject) => {
                    fs.rename(file.path, filePath, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            console.log(`File ${file.originalname} successfully moved to ${filePath}`);
                            resolve();
                        }
                    });
                });
                question.file = filePath;  // Update the question file path

                const ans = new Answer({
                  type: question.type, 
                  file: question.file,
                  questionId: question._id
              });



              // await ans.save();
              // answers.push(ans);
              // console.log(ans)

              const url = 'http://localhost:5001/grade/code'; // Replace with your upload endpoint

              // (async () => {
              //   try {
              //     const formData = new FormData();
              //     formData.append('file', fs.createReadStream(filePath)); // Add the file

              //     const response = await axios.post(url, formData, {
              //       headers: formData.getHeaders(), // Set headers automatically
              //     }
              //   } catch (error) {
              //     console.error("Error occurred:", error);
              //   }
              // });

              try {
                console.log("Inside try block");
                const formData = new FormData();
                formData.append('file', fs.createReadStream(filePath));
                formData.append('question', question.description);
                formData.append('points', question.score);
                formData.append('instruction', question.instruction);
                const response = await axios.post(url, formData, {
                  headers: formData.getHeaders(),
                })


                // console.log("Response received:", response.data);
                const ans = new Answer({
                  type: question.type, 
                  file: filePath,
                  questionId: question._id
              });

                ans['points'] = response.data.points;
                ans['feedback'] = response.data.feedback;

                await ans.save();
                answers.push(ans);
                // console.log(ans)

            } catch (error) {
                console.error("Error occurred:", error);
            }

            } catch (error) {
                console.error(`Error moving file ${file.originalname}:`, error);
            }
        } else if (question.type === 'subjective') {

            const ans = new Answer({
                type: question.type, 
                answer: question.answer,
                questionId: question._id
            });
            
              try {
                  const response = await axios.post('http://localhost:5001/grade', {
                      question: question.description,
                      points: question.score,
                      instruction: question.instruction,
                      answer: question.answer
                  });
                  // console.log("Response received:", response.data);
                  ans['points'] = response.data.points;
                  ans['feedback'] = response.data.feedback;
                  
                  const authorization = req.headers["authorization"];
                  const token = authorization.split(" ")[1];
                  // console.log("token", token)
                  const tokendets = verify(token, process.env.SECRET_ACCESS_TOKEN);

                  let plagAnswers = [{
                    studentId: tokendets._id,
                    answer: question.answer
                  }];
                  homework.appointedStudents.forEach(appointedStudents => {
                      appointedStudents.answers.forEach(hwanswer => {
                        if(hwanswer.questionId.toString() === question._id.toString()) {  
                          plagAnswers.push({
                            studentId: appointedStudents.student,
                            answer: hwanswer.answer
                          })
                        }
                      })
                  });

                  const response2 = await axios.post('http://localhost:5001/plag', {
                      answers: plagAnswers
                  });

                  console.log(response2.data)

                  response2.data.forEach(item => {
                    console.log(item.student1, tokendets._id)
                    if (item.student1.toString() === tokendets._id.toString()) {
                      ans['plag'] = {
                        student1: tokendets._id,
                        student2: item.student2,
                        probability: item.simScore
                      }
                    }
                    else if(item.student2.toString() === tokendets._id.toString()){
                      ans['plag'] = {
                        student1: tokendets._id,
                        student2: item.student1,
                        probability: item.simScore
                      }
                    }
                  });


              } catch (error) {
                  console.error("Error occurred:", error);
              }
            
            await ans.save();
            answers.push(ans);
            console.log(ans)
              

        }

        // updates.push(hwquestion.save());
    }

    const authorization = req.headers["authorization"];
    if (!authorization) return next(new CustomError("You need to login", 400));
  
    const token = authorization.split(" ")[1];
    const { _id, email, role } = verify(token, process.env.SECRET_ACCESS_TOKEN);

    const user = await User.findById(_id);

    // console.log("abcd",user._id, answers);

    // console.log(homework);


    const userIdString = user._id.toString();

    while(homework.appointedStudents.length && !homework.appointedStudents[0].student) homework.appointedStudents.shift();


// Check if there isn't already an element in the array with the same user id
const existingStudentIndex = homework.appointedStudents.findIndex(appointedStudent => appointedStudent.student.toString() === userIdString);

// if (existingStudentIndex === -1) {
//     // If no existing element found, push the new element
//     homework.appointedStudents.push({
//         student: user._id,
//         answers: answers
//     });
// } else {
//     console.log("Student already exists in the array.");
// }

homework.appointedStudents.push({
          student: user._id,
          answers: answers
      });




    await homework.save()

    res.status(200).json({ success: true, data: homework });
});

// Fetching detailed homework information
const getHomework = asyncHandler(async (req, res, next) => {
  const { homeworkID } = req.params;
  const homework = await Homework.findById(homeworkID);
  // console.log(homework);
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
