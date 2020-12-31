const checkMentorAuth = require("../../util/checkMentorAuth");
const checkStudentAuth = require("../../util/checkStudentAuth");
const checkAdminAuth = require("../../util/checkAdminAuth");

const Module = require("../../models/Module");
const Student = require("../../models/Student");
const Mentor = require("../../models/Mentor");
const Comment = require("../../models/Comment");
const StringIntDict = require("../../models/StringIntDict");
const { UserInputError, AuthenticationError } = require("apollo-server");

module.exports = {
  Query: {
    async getModules(_, {}, context) {
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

      const modules = await Module.find();

      if (!modules) {
        throw new UserInputError("Invalid input");
      } else {
        return modules;
      }
    },
    async getComments(_, {}, context) {
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

      const comments = await Module.find();

      if (!comments) {
        throw new UserInputError("Invalid input");
      } else {
        return comments;
      }
    },

    async getCompletedModulesByStudent(_, {}, context) {
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      const completedModules = targetStudent.completedModules;
      return completedModules;
    },
    async getInProgressModulesByStudent(_, {}, context) {
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      const inProgressModules = targetStudent.inProgressModules;
      return inProgressModules;
    },
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
      // TODO regex
      const targetModule = await Module.findOne({ name: search });
      if (!targetModule) {
        throw new UserInputError("Invalid input");
      } else {
        return targetModule;
      }
    },
    async getQuestionsByModule(_, { moduleId }, context) {
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
      const targetModule = await Module.findById(moduleId);

      if (targetModule) {
        const targetQuestions = targetModule.questions;
        return targetQuestions;
      } else {
        return [];
      }
    },
    async getCommentsByModule(_, { moduleId }, context) {
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
      const targetModule = await Module.findById(moduleId);
      if (!targetModule) {
        throw new UserInputError("Invalid input");
      } else {
        const targetComments = targetModule.comments;
        if (!targetComments) {
          return [];
        } else {
          return targetComments;
        }
      }
    },
  },

  Mutation: {
    async createNewComment(_, { moduleId, comment }, context) {
      try {
        var user = checkStudentAuth(context);
      } catch (error) {
        try {
          var user = checkMentorAuth(context);
        } catch (error) {
          throw new Error(error);
        }
      }
      const targetComment = await Comment.findOne({ comment });
      const targetModule = await Module.findById(moduleId);
      if (!targetComment && targetModule) {
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
      } else {
        throw new UserInputError("Invalid input");
      }
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
      const targetModule = await Module.findById(moduleId);
      const targetComment = await Comment.findById(commentId);
      const index = targetModule.comments.indexOf(commentId);
      targetModule.comments.splice(index, 1);
      await targetModule.save();
      await targetComment.delete();
      return targetModule;
    },

    async incrementModulePoints(
      _,
      { moduleId, answerCorrect, numToIncrement },
      context
    ) {
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      const targetModule = await Module.findById(moduleId);
      if (!targetModule) {
        throw new UserInputError("Invalid input");
      } else {
        var modulePointsPair = await StringIntDict.findOne({
          key: moduleId,
        });

        if (!modulePointsPair) {
          throw new UserInputError("Invalid input");
        } else {
          var points = modulePointsPair.value;
          if (answerCorrect) {
            points = points + numToIncrement;
            const index = targetStudent.modulePointsDict.indexOf({
              key: moduleId,
            });
            targetStudent.modulePointsDict.splice(index, 1);
            await targetStudent.save();
            await modulePointsPair.delete();
            const newPair = new StringIntDict({
              key: questionId,
              value: points,
              createdAt: new Date(),
            });
            await newPair.save();
            targetStudent.modulePointsDict.push(newPair);
          }
          return points;
        }
      }
    },
    async addCompletedModule(_, { moduleId }, context) {
      // add to students module list
      try {
        var user = checkStudentAuth(context);
        var targetUser = await Student.findById(user.id);
      } catch (error) {
        try {
          var user = checkMentorAuth(context);
          var targetUser = await Mentor.findById(user.id);
        } catch (error) {
          throw new Error(error);
        }
      }
      const targetModule = await Module.findById(moduleId);
      if (!targetModule || !targetUser.inProgressModules.includes(moduleId)) {
        throw new UserInputError("Invalid input");
      } else if (!targetUser.completedModules.includes(moduleId)) {
        const index = targetUser.inProgressModules.indexOf(moduleId);
        targetUser.inProgressModules.splice(index, 1);
        await targetUser.save();
        await targetUser.completedModules.push(moduleId);
        await targetUser.save();
        const updatedCompletedModules = targetUser.completedModules;
        return updatedCompletedModules;
      }
    },

    async addInProgressModule(_, { moduleId }, context) {
      // add to students module list
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        throw new Error(error);
      }
      const targetModule = await Module.findById(moduleId);
      if (!targetModule) {
        throw new UserInputError("Invalid input");
      } else if (!targetStudent.inProgressModules.includes(moduleId)) {
        await targetStudent.inProgressModules.push(moduleId);
        await targetStudent.save();
        const updatedInProgressModules = targetStudent.inProgressModules;
        return updatedInProgressModules;
      }
    },
    async starModule(_, { moduleId }, context) {
      try {
        var user = checkStudentAuth(context);
        var targetUser = await Student.findById(user.id);
      } catch (error) {
        try {
          var user = checkMentorAuth(context);
          var targetUser = await Mentor.findById(user.id);
        } catch (error) {
          throw new Error(error);
        }
      }
      const targetModule = await Module.findById(moduleId);
      if (!targetModule) {
        throw new UserInputError("Invalid input");
      } else if (!targetUser.starredModules.includes(moduleId)) {
        await targetUser.starredModules.push(moduleId);
        await targetUser.save();
        const updatedStarredModules = targetUser.starredModules;
        return updatedStarredModules;
      }
    },

    async unstarModule(_, { moduleId }, context) {
      try {
        var user = checkStudentAuth(context);
        var targetUser = await Student.findById(user.id);
        // TODO MIGHT have to change this targetuser stuff
      } catch (error) {
        try {
          var user = checkMentorAuth(context);
          var targetUser = await Mentor.findById(user.id);
        } catch (error) {
          throw new Error(error);
        }
      }
      const targetModule = await Module.findById(moduleId);

      if (!targetModule) {
        throw new UserInputError("Invalid input");
      } else if (targetUser.starredModules.includes(moduleId)) {
        const index = targetUser.starredModules.indexOf(moduleId);
        targetUser.starredModules.splice(index, 1);
        await targetUser.save();
        const updatedStarredModules = targetUser.starredModules;
        return updatedStarredModules;
      }
    },
    async startModule(_, { moduleId }, context) {
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      const targetModule = await Module.findById(moduleId);
      // TODO this keeps saying false
      if (
        targetModule &&
        !targetStudent.modulePointsDict.includes({ key: moduleId })
      ) {
        const newPair = new StringIntDict({
          key: moduleId,
          value: 0,
          createdAt: new Date(),
        });
        await newPair.save();
        targetStudent.modulePointsDict.push(newPair);
        await targetStudent.save();
        return newPair;
      } else {
        throw new UserInputError("Invalid input");
      }
    },
  },
};
