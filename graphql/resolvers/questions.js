const checkStudentAuth = require("../../util/checkStudentAuth");
const checkAdminAuth = require("../../util/checkAdminAuth");
const checkMentorAuth = require("../../util/checkMentorAuth");

const { UserInputError, AuthenticationError } = require("apollo-server");

const Question = require("../../models/Question");
const Admin = require("../../models/Admin");
const Student = require("../../models/Student");
const StringStringDict = require("../../models/StringStringDict");

module.exports = {
  Query: {
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
      const targetQuestion = await Question.findById(questionId);
      const allQuesAnsPairs = targetStudent.quesAnsDict;

      var quesAnsPair;
      allQuesAnsPairs.forEach(function (currentQuesAnsPair) {
        if (currentQuesAnsPair.key === questionId) {
          quesAnsPair = currentQuesAnsPair;
        }
      });
      if (!quesAnsPair || !targetQuestion) {
        throw new UserInputError("Invalid input");
      } else {
        const savedAnswer = quesAnsPair.value;
        return savedAnswer;
      }
    },
  },

  Mutation: {
    async startQuestion(_, { questionId }, context) {
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      const targetQuestion = await Question.findById(questionId);
      const allQuesAnsPairs = targetStudent.quesAnsDict;
      var includes = false;
      allQuesAnsPairs.forEach(function (targetQuesAnsPair) {
        if (targetQuesAnsPair.key === questionId) {
          includes = true;
        }
      });
      if (targetQuestion && !includes) {
        const newPair = new StringStringDict({
          key: questionId,
          value: "",
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
