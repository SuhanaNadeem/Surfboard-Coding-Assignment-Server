const checkStudentAuth = require("../../util/checkStudentAuth");
const checkAdminAuth = require("../../util/checkAdminAuth");
const checkMentorAuth = require("../../util/checkMentorAuth");

const { UserInputError, AuthenticationError } = require("apollo-server");

const Question = require("../../models/Question");
const Admin = require("../../models/Admin");

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

      const questions = await QuestionTemplate.find();

      if (!questions) {
        throw new UserInputError("Invalid input");
      } else {
        return questions;
      }
    },
    async getHintByQuestion(_, { questionId }, context) {
      const targetQuestion = Question.findById(questionId);
      if (targetQuestion === null) {
        throw new UserInputError("Invalid input");
      } else {
        const targetHint = await targetQuestion.hint;
        return targetHint;
      }
    },
    async getSavedAnswerByQuestion(_, { questionId }, context) {
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        console.log(error);
        return None;
      }
      const quesAnsPair = targetStudent.quesAnsDict.findOne({
        key: questionId,
      });
      if (quesAnsPair === null) {
        throw new UserInputError("Invalid input");
      } else {
        const savedAnswer = quesAnsPair.value;
        return savedAnswer;
      }
    },
  },

  Mutation: {
    async createHint(
      _,
      { questionId, categoryId, moduleId, hintDescription },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      targetQuestion = Question.findById(questionId);
      if (targetQuestion !== null && targetQuestion.hint === null) {
        const newHint = new Module({
          questionId,
          categoryId,
          moduleId,
          hintDescription,
          createdAt: new Date(),
        });
        await newHint.save();
        targetQuestion.hint = newHint.id;
        return newHint;
      }
      return new UserInputError("Invalid input");
    },
    async editHint(
      _,
      { questionId, newCategoryId, newModuleId, newHintDescription },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      targetQuestion = Question.findById(questionId);
      if (targetQuestion !== null) {
        targetQuestion.categoryId = newCategoryId;
        targetQuestion.moduleId = newModuleId;
        targetQuestion.hintDescription = newHintDescription;
        await targetQuestion.save();
        const updatedHint = targetQuestion.hint;
        return updatedHint;
      }
      throw new UserInputError("Invalid input");
    },
    async deleteHint(_, { questionId }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      targetQuestion = Question.findById(questionId);
      if (targetQuestion !== null) {
        await targetQuestion.hint.delete();
        await targetQuestion.save();
        return targetQuestion;
      }
      return new UserInputError("Invalid input");
    },
  },
};
