const checkAdminAuth = require("../../util/checkAdminAuth");
const checkMentorAuth = require("../../util/checkMentorAuth");
const checkStudentAuth = require("../../util/checkStudentAuth");

const Admin = require("../../models/Admin");
const Category = require("../../models/Category");

const { UserInputError, AuthenticationError } = require("apollo-server");

module.exports = {
  Query: {
    async getCategories(_, {}, context) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        try {
          const mentor = checkMentorAuth(context);
        } catch (error) {
          const student = checkStudentAuth(context);
          if (!student) {
            throw AuthenticationError;
          }
        }
      }

      const categories = await Category.find();

      if (!categories) {
        throw UserInputError("Invalid input");
      } else {
        return categories;
      }
    },

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
        throw UserInputError("Invalid input");
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
        throw UserInputError("Invalid input");
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
        throw UserInputError("Invalid input");
      }
    },
  },
};
