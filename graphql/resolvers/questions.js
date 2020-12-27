const checkStudentAuth = require("../../util/checkStudentAuth");
const checkAdminAuth = require("../../util/checkAdminAuth");

const { UserInputError, AuthenticationError } = require("apollo-server");

const Question = require("../../models/Question");
const Admin = require("../../models/Admin");

module.exports = {
  Query: {
    async getHintByQuestion(_, { questionId }, context) {
      const targetQuestion = Question.findById(questionId);
      if (targetQuestion === null) {
        throw UserInputError;
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
        throw UserInputError;
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
        throw AuthenticationError;
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
      return UserInputError;
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
        throw AuthenticationError;
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
      return UserInputError;
    },
    async deleteHint(_, { questionId }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw AuthenticationError;
      }
      targetQuestion = Question.findById(questionId);
      if (targetQuestion !== null) {
        await targetQuestion.hint.delete();
        await targetQuestion.save();
        return targetQuestion;
      }
      return UserInputError;
    },
  },
};
