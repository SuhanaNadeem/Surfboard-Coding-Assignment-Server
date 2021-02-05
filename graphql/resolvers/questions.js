const checkStudentAuth = require("../../util/checkStudentAuth");
const checkAdminAuth = require("../../util/checkAdminAuth");
const checkMentorAuth = require("../../util/checkMentorAuth");

const { UserInputError, AuthenticationError } = require("apollo-server");

const Question = require("../../models/Question");
const Admin = require("../../models/Admin");
const Student = require("../../models/Student");
const StringStringDict = require("../../models/StringStringDict");
const Module = require("../../models/Module");

module.exports = {
  Query: {
    async getQuestionById(_, { questionId }, context) {
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
      if (!targetQuestion) {
        throw new UserInputError("Invalid input");
      } else {
        return targetQuestion;
      }
    },

    async getQuestions(_, {}, context) {
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

      const questions = await Question.find();

      if (!questions) {
        throw new UserInputError("Invalid input");
      } else {
        return questions;
      }
    },
    async getCompletedQuestionsByModule(_, { moduleId, studentId }, context) {
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
      const targetModule = await Module.findById(moduleId);

      var allModuleQuestions = targetModule.questions;
      if (!targetStudent || !allModuleQuestions || !targetModule) {
        throw new UserInputError("Invalid input");
      } else {
        const allQuesAnsPairs = targetStudent.quesAnsDict;
        var completedQuestions = [];
        var currentQuestion;
        allQuesAnsPairs.forEach(async function (currentQuesAnsPair) {
          if (
            allModuleQuestions.includes(currentQuesAnsPair.key) &&
            currentQuesAnsPair.value !== ""
          ) {
            currentQuestion = await Question.findById(currentQuesAnsPair.key);
            completedQuestions.push(currentQuestion);
          }
        });
        return completedQuestions;
      }
    },

    async getHintByQuestion(_, { questionId }, context) {
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
      if (!targetQuestion) {
        throw new UserInputError("Invalid input");
      } else {
        const targetHint = targetQuestion.hint;
        return targetHint;
      }
    },
    async getSavedAnswerByQuestion(_, { questionId }, context) {
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      // const targetQuestion = await Question.findById(questionId);
      // const allQuesAnsPairs = targetStudent.quesAnsDict;

      // var quesAnsPair;
      // allQuesAnsPairs.forEach(function (currentQuesAnsPair) {
      //   if (currentQuesAnsPair.key === questionId) {
      //     quesAnsPair = currentQuesAnsPair;
      //   }
      // });

      const targetQuesAnsPair = await StringStringDict.find({
        key: questionId,
        studentId,
      });

      if (!targetQuesAnsPair || targetQuesAnsPair.length == 0) {
        throw new UserInputError("Invalid input");
      } else {
        const savedAnswer = targetQuesAnsPair[0].value;
        return savedAnswer;
      }
    },
  },

  Mutation: {
    async startQuestion(_, { questionId, studentId }, context) {
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      const targetQuestion = await Question.findById(questionId);
      const targetQuesAnsPair = await StringStringDict.find({
        key: questionId,
        studentId,
      });
      // const allQuesAnsPairs = targetStudent.quesAnsDict;
      // var includes = false;
      // allQuesAnsPairs.forEach(function (targetQuesAnsPair) {
      //   if (targetQuesAnsPair.key === questionId) {
      //     includes = true;
      //   }
      // });
      if (
        targetQuestion &&
        (!targetQuesAnsPair || targetQuesAnsPair.length == 0)
      ) {
        const newPair = new StringStringDict({
          key: questionId,
          value: "",
          studentId,
          createdAt: new Date(),
        });
        await newPair.save();
        targetStudent.quesAnsDict.push(newPair);
        await targetStudent.save();
        return newPair;
      } else {
        throw new UserInputError("Invalid input");
      }
    },
  },
};
