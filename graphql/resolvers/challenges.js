const checkAdminAuth = require("../../util/checkAdminAuth");
const checkMentorAuth = require("../../util/checkMentorAuth");
const checkStudentAuth = require("../../util/checkStudentAuth");

const { UserInputError, AuthenticationError } = require("apollo-server");
const Challenge = require("../../models/Challenge");

module.exports = {
  Query: {
    async getChallenges(_, {}, context) {
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

      const challenges = await Challenge.find();

      if (!challenges) {
        throw new UserInputError("Invalid input");
      } else {
        return challenges;
      }
    },
  },
};
