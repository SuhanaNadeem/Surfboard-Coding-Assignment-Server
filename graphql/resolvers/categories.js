const checkAdminAuth = require("../../util/checkAdminAuth");

const Admin = require("../../models/Admin");
const { UserInputError, AuthenticationError } = require("apollo-server");

module.exports = {
  Query: {
    async getQuestionTemplatesByCategory(_, { categoryId }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw AuthenticationError;
      }
      const targetQuestionTemplates = await targetAdmin.questionTemplates;
      if (targetQuestionTemplates !== null) {
        const matches = await targetQuestionTemplates.find({ categoryId });
        if (matches === null) {
          return [];
        } else {
          return matches;
        }
      } else {
        throw UserInputError;
      }
    },
    async getChallengesByCategory(_, { categoryId }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw AuthenticationError;
      }
      const targetChallenges = await targetAdmin.challenges;
      if (targetChallenges !== null) {
        const matches = await targetChallenges.find({ categoryId });
        if (matches === null) {
          return [];
        } else {
          return matches;
        }
      } else {
        throw UserInputError;
      }
    },
    async getModulesByCategory(_, { categoryId }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw AuthenticationError;
      }
      const targetModules = await targetAdmin.modules;
      if (targetModules !== null) {
        const matches = await targetModules.find({ categoryId });
        if (matches === null) {
          return [];
        } else {
          return matches;
        }
      } else {
        throw UserInputError;
      }
    },
  },

  Mutation: {},
};
