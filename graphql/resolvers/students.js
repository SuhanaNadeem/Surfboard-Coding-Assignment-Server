const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError, AuthenticationError } = require("apollo-server");

const {
  validateUserRegisterInput,
  validateUserLoginInput,
} = require("../../util/validators");
const SECRET_KEY = process.env.SECRET_STUDENT_KEY;
const Student = require("../../models/Student");
const Badge = require("../../models/Badge");
const Question = require("../../models/Question");
const Mentor = require("../../models/Mentor");
const Answer = require("../../models/Answer");

const checkStudentAuth = require("../../util/checkStudentAuth");
const checkAdminAuth = require("../../util/checkAdminAuth");
const checkMentorAuth = require("../../util/checkMentorAuth");
const answerResolvers = require("./answers");
const moduleResolvers = require("./modules");

function generateToken(student) {
  return jwt.sign(
    {
      id: student.id,
      email: student.email,
    },
    SECRET_KEY
    //{ expiresIn: "3h" }
  );
}

module.exports = {
  Query: {
    async getStudent(_, {}, context) {
      try {
        const student = checkStudentAuth(context);
        const targetStudent = await Student.findById(student.id);
        return targetStudent;
      } catch (error) {
        throw new UserInputError("Invalid input");
      }
    },

    async getStudentById(_, { studentId }, context) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        try {
          const mentor = checkMentorAuth(context);
        } catch (error) {
          const student = checkStudentAuth(context);
          if (!student) {
            throw new AuthenticationError();
          }
        }
      }
      const targetStudent = await Student.findById(studentId);
      if (!targetStudent) {
        throw new UserInputError("Invalid input");
      } else {
        return targetStudent;
      }
    },
    async getStudents(_, {}, context) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        try {
          const mentor = checkMentorAuth(context);
        } catch (error) {
          const student = checkStudentAuth(context);
          if (!student) {
            throw new AuthenticationError();
          }
        }
      }
      const students = await Student.find();
      if (!students) {
        throw new UserInputError("Invalid input");
      } else {
        return students;
      }
    },

    async getMentorsByStudent(_, {}, context) {
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      const mentors = targetStudent.mentors;
      return mentors;
    },
  },

  Mutation: {
    async signupStudent(
      _,
      { email, orgName, name, password, confirmPassword },
      context
    ) {
      var { valid, errors } = validateUserRegisterInput(
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const checkStudent = await Student.findOne({ email });
      if (checkStudent) {
        throw new UserInputError("Email already exists", {
          errors: {
            email: "An student with this email already exists",
          },
        });
      }

      password = await bcrypt.hash(password, 12);

      const newStudent = new Student({
        email,
        name,
        orgName,
        password,
        inProgressModules: [],
        completedModules: [],
        badges: [],
        starredModules: [],
        starredQuestions: [],
        mentors: [],
        quesAnsDict: [],
        modulePointsDict: [],
        createdAt: new Date(),
      });

      const res = await newStudent.save();

      const token = generateToken(res);

      return { ...res._doc, id: res._id, token };
    },

    async loginStudent(_, { email, password }, context) {
      const { errors, valid } = validateUserLoginInput(email, password);
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const student = await Student.findOne({ email });

      if (!student) {
        errors.email = "Student not found";
        throw new UserInputError("Student not found", {
          errors,
        });
      }

      const match = await bcrypt.compare(password, student.password);

      if (!match) {
        errors.password = "Wrong credentials";
        throw new UserInputError("Wrong credentials", {
          errors,
        });
      }

      const token = generateToken(student);
      return { ...student._doc, id: student._id, token };
    },

    async deleteStudent(_, { studentId }, context) {
      try {
        var user = checkAdminAuth(context);
      } catch (error) {
        try {
          var user = checkMentorAuth(context);
        } catch (error) {
          throw new Error(error);
        }
      }
      const targetStudent = await Student.findById(studentId);
      if (targetStudent) {
        await targetStudent.delete();
        return "Delete Successful";
      } else {
        throw new UserInputError("Invalid input");
      }
    },

    async starQuestion(_, { questionId }, context) {
      try {
        var user = checkStudentAuth(context);
        var targetUser = await Student.findById(user.id);
      } catch (error) {
        try {
          var user = checkMentorAuth(context);
          var targetUser = await Mentor.findById(user.id);
        } catch (error) {
          throw new Error(error);
        }
      }
      const targetQuestion = await Question.findById(questionId);
      if (!targetQuestion || targetUser.starredQuestions.includes(questionId)) {
        throw new UserInputError("Invalid input");
      } else {
        await targetUser.starredQuestions.push(questionId);
        await targetUser.save();
        const updatedStarredQuestions = targetUser.starredQuestions;
        return updatedStarredQuestions;
      }
    },
    async unstarQuestion(_, { questionId }, context) {
      try {
        var user = checkStudentAuth(context);
        var targetUser = await Student.findById(user.id);
      } catch (error) {
        try {
          var user = checkMentorAuth(context);
          var targetUser = await Mentor.findById(user.id);
        } catch (error) {
          throw new Error(error);
        }
      }
      const targetQuestion = Question.findById(questionId);
      if (
        !targetQuestion ||
        !targetUser.starredQuestions.includes(questionId)
      ) {
        throw new UserInputError("Invalid input");
      } else {
        const index = targetUser.starredQuestions.indexOf(questionId);
        targetUser.starredQuestions.splice(index, 1);
        await targetUser.save();
        const updatedStarredQuestions = targetUser.starredQuestions;
        return updatedStarredQuestions;
      }
    },
    async handleAnswerPoints(_, { answer, studentId, questionId }, context) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        try {
          const mentor = checkMentorAuth(context);
        } catch (error) {
          const student = checkStudentAuth(context);
          if (!student) {
            throw new AuthenticationError();
          }
        }
      }
      const targetQuestion = await Question.findById(questionId);
      const moduleId = targetQuestion.moduleId;
      const numToIncrement = targetQuestion.points;
      var answerCorrect;
      if (
        !targetQuestion ||
        (targetQuestion.type !== "Skill" && targetQuestion.type !== "Question")
      ) {
        throw new UserInputError("Invalid input");
      } else if (targetQuestion.type === "Skill") {
        answerCorrect = true;
        const updatedPoints = await moduleResolvers.Mutation.incrementModulePoints(
          _,
          { moduleId, answerCorrect, numToIncrement, studentId },
          context
        );
        return updatedPoints;
      } else {
        if (targetQuestion.expectedAnswer === "") {
          await answerResolvers.Mutation.saveAnswer(
            _,
            { answer, studentId, questionId },
            context
          );
          answerCorrect = true;
          const updatedPoints = await moduleResolvers.Mutation.incrementModulePoints(
            _,
            { moduleId, answerCorrect, numToIncrement, studentId },
            context
          );
          return updatedPoints;
        } else {
          const savedAnswer = await answerResolvers.Mutation.saveAnswer(
            _,
            { answer, studentId, questionId },
            context
          );
          const answerId = savedAnswer.id;
          answerCorrect = await module.exports.Mutation.verifyAnswer(
            _,
            { answerId, questionId },
            context
          );
          const updatedPoints = await moduleResolvers.Mutation.incrementModulePoints(
            _,
            { moduleId, answerCorrect, numToIncrement, studentId },
            context
          );
          return updatedPoints;
        }
      }
    },
    async verifyAnswer(_, { answerId, questionId }, context) {
      try {
        const student = checkStudentAuth(context);
      } catch (error) {
        throw new AuthenticationError();
      }

      // await module.exports.Mutation.
      // FOR QUESTIONS WHERE EXPECTED ANS !null --> saveAnswer() --> verifyAnswer() --> incrementModulePoints w/ previous' returned value
      // FOR QUESTIONS WHERE EXPECTED ANS =null (no right ans) --> saveAnswer() --> incrementModulePoints w/ true
      // FOR SKILLS --> incrementModulePoints w/ true
      const targetQuestion = await Question.findById(questionId);
      const targetAnswer = await Answer.findById(answerId);
      const expectedAnswer = targetQuestion.expectedAnswer;
      if (!targetAnswer || !targetQuestion || !expectedAnswer) {
        throw new AuthenticationError();
      } else if (targetAnswer.answer === expectedAnswer) {
        return true;
      } else {
        return false;
      }
    },
    async addMentor(_, { mentorId }, context) {
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        throw new Error(error);
      }

      const targetMentor = await Mentor.findById(mentorId);
      if (!targetMentor || targetStudent.mentors.includes(mentorId)) {
        throw new UserInputError("Invalid input");
      } else {
        await targetStudent.mentors.push(mentorId);
        await targetStudent.save();
      }
      const updatedMentors = targetStudent.mentors;
      return updatedMentors;
    },
  },
};
