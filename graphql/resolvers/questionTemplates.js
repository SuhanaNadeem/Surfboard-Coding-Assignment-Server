const checkStudentAuth = require("../../util/checkStudentAuth");
const checkAdminAuth = require("../../util/checkAdminAuth");
const checkMentorAuth = require("../../util/checkMentorAuth");

const { UserInputError, AuthenticationError } = require("apollo-server");

const QuestionTemplate = require("../../models/QuestionTemplate");

module.exports = {
  Query: {
    async getQuestionTemplates(_, {}, context) {
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

      const questionTemplates = await QuestionTemplate.find();

      if (!questionTemplates) {
        throw new UserInputError("Invalid input");
      } else {
        return questionTemplates;
      }
    },
  },
};
