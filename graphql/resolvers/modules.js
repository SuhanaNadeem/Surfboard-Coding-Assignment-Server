const checkMentorAuth = require("../../util/checkMentorAuth");
const checkStudentAuth = require("../../util/checkStudentAuth");

const Module = require("../../models/Module");

module.exports = {
  Query: {
    async getModulesBySearch(_, { search }, context) {
      //   try {
      //     const student = checkStudentAuth(context);
      //     var targetUser = await Student.findById(student.id);
      //   } catch (error) {
      //     try {
      //       const admin = checkAdminAuth(context);
      //       var targetUser = await Admin.findById(admin.id);
      //     } catch (error) {
      //       const mentor = checkMentorAuth(context);
      //       var targetUser = await Mentor.findById(mentor.id);
      //     }
      //   }
      // TODO multiple item search
      const targetModule = await Module.findOne({ name: search });
      if (targetModule === null) {
        return null;
      } else {
        return targetModule;
      }
    },
    async getQuestionsByModule(_, { moduleId }, context) {
      const targetQuestions = await Module.findById(moduleId).questions;
      if (targetQuestions === null) {
        return [];
      } else {
        return targetQuestions;
      }
    },
    async getCommentsByModule(_, { moduleId }, context) {
      const targetComments = await Module.findById(moduleId).comments;
      if (targetComments === null) {
        return [];
      } else {
        return targetComments;
      }
    },
  },

  Mutation: {
    async createComment(_, { moduleId, comment }, context) {
      try {
        var user = checkStudentAuth(context);
      } catch (error) {
        try {
          var user = checkMentorAuth(context);
        } catch (error) {
          throw new Error(error);
        }
      }
      targetModule = Module.findOne(moduleId);
      const newComment = new Comment({
        comment: comment,
        moduleId: moduleId,
        createdAt: new Date(),
        personId: user.id,
      });
      await newComment.save();
      await targetModule.comments.push(newComment);
      await targetModule.save();
      return targetModule;
    },

    async deleteComment(_, { moduleId, commentId }, context) {
      try {
        var user = checkStudentAuth(context);
      } catch (error) {
        try {
          var user = checkMentorAuth(context);
        } catch (error) {
          throw new Error(error);
        }
      }
      targetModule = Module.findOne(moduleId);
      targetComment = targetModule.comments.findById(commentId);
      await targetComment.delete();
      await targetModule.save();
      return targetModule;
    },
  },
};
