const checkMentorAuth = require("../../util/checkMentorAuth");
const checkStudentAuth = require("../../util/checkStudentAuth");
const checkAdminAuth = require("../../util/checkAdminAuth");

const Module = require("../../models/Module");
const Student = require("../../models/Student");
const Comment = require("../../models/Comment");
const { UserInputError } = require("apollo-server");

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
      //TODO: fix this, finish comment related, then student, then mentor
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
        console.log(error);
        return None;
      }
      const targetModule = Module.findById(moduleId);
      if (targetModule !== null) {
        const studentModule = targetStudent.modulePointsDict.findOne({
          key: moduleId,
        });
        if (answerCorrect) {
          studentModule.value = studentModule.value + numToIncrement;
          await studentModule.save();
        }
        return studentModule.value;
      }
      throw new UserInputError("Invalid input");
    },
  },
};
