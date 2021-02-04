const checkMentorAuth = require("../../util/checkMentorAuth");
const checkStudentAuth = require("../../util/checkStudentAuth");
const checkAdminAuth = require("../../util/checkAdminAuth");

const Module = require("../../models/Module");
const Student = require("../../models/Student");
const Mentor = require("../../models/Mentor");
const Comment = require("../../models/Comment");
const StringIntDict = require("../../models/StringIntDict");
const { UserInputError, AuthenticationError } = require("apollo-server");
const Question = require("../../models/Question");

module.exports = {
  Query: {
    async getModuleById(_, { moduleId }, context) {
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

      const module = await Module.findById(moduleId);
      if (!module) {
        throw new UserInputError("Invalid input");
      } else {
        return module;
      }
    },

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

      return modules;
    },

    async getModulePointsByStudent(_, { studentId, moduleId }, context) {
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
      const targetModulePointsPair = await StringIntDict.find({
        key: moduleId,
        studentId,
      });
      if (!targetModulePointsPair || targetModulePointsPair.length == 0) {
        throw new UserInputError("Invalid input");
      } else {
        const modulePoints = targetModulePointsPair[0].value;
        return modulePoints;
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
      const completedModuleIds = targetStudent.completedModules;

      const completedModules = await Module.find({
        _id: { $in: completedModuleIds },
      });
      return completedModules;
    },
    async getInProgressModulesByStudent(_, {}, context) {
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      const inProgressModuleIds = targetStudent.inProgressModules;

      const inProgressModules = await Module.find({
        _id: { $in: inProgressModuleIds },
      });
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
    async getTotalPossibleModulePoints(_, { moduleId }, context) {
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
      const moduleQuestions = targetModule.questions;
      if (!targetModule || !moduleQuestions) {
        throw new UserInputError("Invalid input");
      } else {
        var totalPoints = 0;
        var points;
        const allQuestions = await Question.find({ moduleId });
        allQuestions.forEach(function (targetQuestion) {
          points = targetQuestion.points;
          if (points) {
            totalPoints += points;
          }
        });
        return totalPoints;
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
      { moduleId, answerCorrect, numToIncrement, studentId },
      context
    ) {
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      const targetModulePointsPair = await StringIntDict.find({
        key: moduleId,
        studentId,
      });

      if (!targetModulePointsPair || targetModulePointsPair.length == 0) {
        throw new UserInputError("Invalid input");
      } else {
        var points = targetModulePointsPair[0].value;

        if (answerCorrect) {
          points = points + numToIncrement;
          const index = targetStudent.modulePointsDict.indexOf({
            key: moduleId,
            studentId,
          });
          targetStudent.modulePointsDict.splice(index, 1);
          await targetStudent.save();

          await StringIntDict.deleteOne({ key: moduleId, studentId });
          const newPair = new StringIntDict({
            key: moduleId,
            value: points,
            studentId,
            createdAt: new Date(),
          });
          await newPair.save();
          targetStudent.modulePointsDict.push(newPair);
          await targetStudent.save();
        }
        return points;
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
        // currently you're allowed to redo a completed module - when you open it, it should have the previous info
        await targetStudent.inProgressModules.push(moduleId);
        await targetStudent.save();
        const updatedInProgressModules = targetStudent.inProgressModules;
        return updatedInProgressModules;
      } else {
        throw new UserInputError("Invalid input");
      }
    },

    async removeInProgressModule(_, { moduleId, studentId }, context) {
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
      const targetStudent = await Student.findById(studentId);
      const targetModule = await Module.findById(moduleId);
      if (!targetModule) {
        throw new UserInputError("Invalid input");
      } else if (targetStudent.inProgressModules.includes(moduleId)) {
        const index = targetStudent.inProgressModules.indexOf(moduleId);
        targetStudent.inProgressModules.splice(index, 1);
        await targetStudent.save();
        const targetModulePointsPair = await StringIntDict.find({
          key: moduleId,
        });
        await targetModulePointsPair.delete();
        const updatedInProgressModules = targetStudent.inProgressModules;
        return updatedInProgressModules;
      } else {
        throw new UserInputError("Invalid input");
      }
    },

    async removeCompletedModule(_, { moduleId, studentId }, context) {
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
      const targetStudent = await Student.findById(studentId);
      const targetModule = await Module.findById(moduleId);
      if (!targetModule) {
        throw new UserInputError("Invalid input");
      } else if (targetStudent.completedModules.includes(moduleId)) {
        const index = targetStudent.completedModules.indexOf(moduleId);
        targetStudent.completedModules.splice(index, 1);
        await targetStudent.save();
        const targetModulePointsPair = await StringIntDict.find({
          key: moduleId,
        });
        await targetModulePointsPair.delete();
        const updatedcompletedModules = targetStudent.completedModules;
        return updatedcompletedModules;
      } else {
        throw new UserInputError("Invalid input");
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
    async startModule(_, { moduleId, studentId }, context) {
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
      var targetStudent = await Student.findById(studentId);

      if (!targetStudent) {
        throw new UserInputError("Invalid input");
      }
      const targetModule = await Module.findById(moduleId);
      const targetPair = await StringIntDict.find({ key: moduleId, studentId });
      // var includes = false;
      // allModulePointPairs.forEach(function (targetModulePointsPair) {
      //   if (
      //     targetModulePointsPair.key === moduleId &&
      //     targetModulePointsPair.studentId === studentId
      //   ) {
      //     includes = true;
      //   }
      // });
      console.log(targetModule);
      console.log(targetPair);
      if (targetModule && (!targetPair || targetPair.length === 0)) {
        const newPair = new StringIntDict({
          key: moduleId,
          value: 0,
          studentId,
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
