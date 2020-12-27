const checkMentorAuth = require("../../util/checkMentorAuth");
const checkStudentAuth = require("../../util/checkStudentAuth");
const { UserInputError, AuthenticationError } = require("apollo-server");

const Question = require("../../models/Question");

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
  },

  Mutation: {},
};
