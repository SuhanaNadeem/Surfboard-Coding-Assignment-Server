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
      // console.log(studentId);
      // console.log(moduleId);
      const targetModulePointsPairs = await StringIntDict.find({
        key: moduleId,
        studentId,
      });
      const targetStudent = await Student.findById(studentId);
      var targetModulePointsPair;
      targetModulePointsPairs.forEach(async function (currentStringIntDict) {
        console.log(currentStringIntDict);
        targetStudent.modulePointsDict.forEach(async function (
          currentModulePointsPair
        ) {
          if (currentModulePointsPair.id === currentStringIntDict.id) {
            targetModulePointsPair = currentModulePointsPair;
          }
        });
      });

      // console.log(targetModulePointsPair);
      if (!targetStudent || targetModulePointsPair == undefined) {
        throw new UserInputError("Invalid input");
      } else {
        const modulePoints = targetModulePointsPair.value;
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

    async getCompletedModulesByStudent(_, { studentId }, context) {
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
      const completedModuleIds = targetStudent.completedModules;
      if (!targetStudent) {
        throw new UserInputError("Invalid input");
      } else {
        const completedModules = await Module.find({
          _id: { $in: completedModuleIds },
        });
        return completedModules;
      }
    },
    async getInProgressModulesByStudent(_, { studentId }, context) {
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
      const inProgressModuleIds = targetStudent.inProgressModules;
      if (!targetStudent) {
        throw new UserInputError("Invalid input");
      } else {
        const inProgressModules = await Module.find({
          _id: { $in: inProgressModuleIds },
        });
        return inProgressModules;
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
      // console.log("makes it here");
      // console.log(targetModule);
      const moduleQuestions = targetModule.questions;
      // console.log("but not here");
      if (!targetModule || !moduleQuestions) {
        // console.log("IN?");
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

    async deleteModulePointsPair(_, { moduleId, studentId }, context) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        throw new AuthenticationError();
      }
      var targetStudent = await Student.findById(studentId);

      const targetModulePointsPair = await StringIntDict.findOne({
        key: moduleId,
        studentId,
      });

      var index = -1;
      targetStudent.modulePointsDict.forEach(async function (
        targetStringIntDict
      ) {
        if (
          targetStringIntDict.key === moduleId &&
          targetStringIntDict.studentId === studentId
        ) {
          index = targetStudent.modulePointsDict.indexOf(targetStringIntDict);
        }
      });

      // console.log("target: " + targetModulePointsPair);
      if (!targetModulePointsPair || index === -1) {
        throw new UserInputError("Invalid input");
      } else {
        // const index = targetStudent.modulePointsDict.indexOf({
        //   key: moduleId,
        //   studentId,
        // });
        targetStudent.modulePointsDict.splice(index, 1);
        await targetStudent.save();
        // console.log(targetStudent.modulePointsDict);
        return "Delete Successful";
      }
    },
    async adjustModulePoints(_, { moduleId, studentId, points }, context) {
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
      // const targetModulePointsPair = await StringIntDict.findOne({
      //   key: moduleId,
      //   studentId,
      // });

      const targetStudent = await Student.findById(studentId);
      const targetModule = await Module.findById(moduleId);

      var index = -1;
      targetStudent.modulePointsDict.forEach(async function (
        targetModulePointsPair
      ) {
        if (
          targetModulePointsPair.key === moduleId &&
          targetModulePointsPair.studentId === studentId
        ) {
          index = targetStudent.modulePointsDict.indexOf(
            targetModulePointsPair
          );
        }
      });

      if (!targetStudent || !targetModule) {
        throw new UserInputError("Invalid input");
      } else if (index === -1) {
        const newPair = new StringIntDict({
          key: moduleId,
          value: points,
          studentId,
          createdAt: new Date(),
        });
        await newPair.save();
        targetStudent.modulePointsDict.push(newPair);
        await targetStudent.save();
        return "Added new with adjusted points";
      } else {
        // const newPair = new StringIntDict({
        //   key: moduleId,
        //   value: points,
        //   studentId,
        //   createdAt: new Date(),
        // });
        // await newPair.save();
        // targetStudent.modulePointsDict.push(newPair);
        // await targetStudent.save();
        // return "Temporary";
        // console.log("found: "+target)

        // const index = targetStudent.modulePointsDict.indexOf({
        //   key: moduleId,
        //   studentId,
        // });
        targetStudent.modulePointsDict.splice(index, 1);
        await targetStudent.save();
        // console.log("Removed from student's list");
        // console.log(targetStudent.modulePointsDict);

        await StringIntDict.deleteOne({ key: moduleId, studentId });
        // console.log("Deleted that stringint dict");

        const newPair = new StringIntDict({
          key: moduleId,
          value: points,
          studentId,
          createdAt: new Date(),
        });
        await newPair.save();
        // console.log("Created new stringint dict");

        targetStudent.modulePointsDict.push(newPair);
        await targetStudent.save();
        // console.log("pushed to student's list");

        return "Deleted old and added new with adjusted points";
      }
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
      const targetModulePointsPair = await StringIntDict.findOne({
        key: moduleId,
        studentId,
      });

      var index = -1;
      targetStudent.modulePointsDict.forEach(async function (
        targetModulePointsPair
      ) {
        if (
          targetModulePointsPair.key === moduleId &&
          targetModulePointsPair.studentId === studentId
        ) {
          index = targetStudent.modulePointsDict.indexOf(
            targetModulePointsPair
          );
        }
      });

      if (!targetModulePointsPair || index === -1) {
        throw new UserInputError("Invalid input");
      } else {
        var points = targetModulePointsPair.value;

        if (answerCorrect) {
          points = points + numToIncrement;

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

          targetStudent.modulePointsDict.push(newPair); // HERE
          await targetStudent.save();
        }
        return points;
      }
    },
    async decrementModulePoints(
      _,
      { moduleId, numToDecrement, studentId },
      context
    ) {
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      const targetModulePointsPair = await StringIntDict.findOne({
        key: moduleId,
        studentId,
      });

      var index = -1;
      targetStudent.modulePointsDict.forEach(async function (
        targetStringIntDict
      ) {
        if (
          targetStringIntDict.key === moduleId &&
          targetStringIntDict.studentId === studentId
        ) {
          index = targetStudent.modulePointsDict.indexOf(targetStringIntDict);
        }
      });

      if (!targetModulePointsPair || index == -1) {
        throw new UserInputError("Invalid input");
      } else {
        var points = targetModulePointsPair[0].value;
        points = points - numToDecrement;
        // const index = targetStudent.modulePointsDict.indexOf({
        //   key: moduleId,
        //   studentId,
        // });

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
        return points;
      }
    },

    async addCompletedModule(_, { moduleId, studentId }, context) {
      // add to students module list
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
      // console.log("inside info");
      // console.log(targetModule);
      // console.log(targetStudent.completedModules);
      if (
        !targetStudent ||
        !targetModule ||
        !targetStudent.inProgressModules.includes(moduleId)
      ) {
        throw new UserInputError("Invalid input");
      } else if (!targetStudent.completedModules.includes(moduleId)) {
        // console.log("entered right loop");
        const index = targetStudent.inProgressModules.indexOf(moduleId);
        targetStudent.inProgressModules.splice(index, 1);
        await targetStudent.save();
        await targetStudent.completedModules.push(moduleId);
        await targetStudent.save();
        const updatedCompletedModules = targetStudent.completedModules;
        // console.log("updated");
        // console.log(updatedCompletedModules);
        return updatedCompletedModules;
      }
    },
    // first starting, then adding in prog
    async addInProgressModule(_, { moduleId, studentId }, context) {
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
      // console.log(8);
      const targetStudent = await Student.findById(studentId);
      const targetModulePointsPair = await StringIntDict.findOne({
        key: moduleId,
        studentId,
      });
      const targetModule = await Module.findById(moduleId);
      // console.log(9);
      if (
        !targetStudent ||
        !targetModule ||
        !targetModulePointsPair ||
        // targetModulePointsPair.length === 0 ||
        targetStudent.inProgressModules.includes(moduleId)
      ) {
        // console.log(10);
        //  console.log(3);
        throw new UserInputError("Invalid input");
      } else {
        // console.log(11);
        // currently you're allowed to redo a completed module - when you open it, it should have the previous info
        await targetStudent.inProgressModules.push(moduleId);
        // console.log(12);
        await targetStudent.save();
        // console.log(13);
        const updatedInProgressModules = targetStudent.inProgressModules;
        // console.log(14);
        return updatedInProgressModules;
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
        // const targetModulePointsPair = await StringIntDict.findById({
        //   key: moduleId,
        //   studentId,
        // });
        // await targetModulePointsPair.delete();
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
        // const targetModulePointsPair = await StringIntDict.find({
        //   key: moduleId,
        //   studentId,
        // });
        // await targetModulePointsPair.delete();
        const updatedCompletedModules = targetStudent.completedModules;
        return updatedCompletedModules;
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
      if (!targetModule || targetUser.starredModules.includes(moduleId)) {
        throw new UserInputError("Invalid input");
      } else {
        targetUser.starredModules.push(moduleId);
        await targetUser.save();
        const updatedStarredModules = targetUser.starredModules;
        return updatedStarredModules;
      }
    },

    async unstarModule(_, { moduleId }, context) {
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

      if (!targetModule || !targetUser.starredModules.includes(moduleId)) {
        throw new UserInputError("Invalid input");
      } else {
        const index = targetUser.starredModules.indexOf(moduleId);
        targetUser.starredModules.splice(index, 1);
        await targetUser.save();
        const updatedStarredModules = targetUser.starredModules;
        return updatedStarredModules;
      }
    },

    async handleStarModule(_, { moduleId }, context) {
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
      var updatedStarredModules;
      if (!targetUser.starredModules.includes(moduleId)) {
        updatedStarredModules = await module.exports.Mutation.starModule(
          _,
          { moduleId },
          context
        );
      } else {
        updatedStarredModules = await module.exports.Mutation.unstarModule(
          _,
          { moduleId },
          context
        );
      }
      return updatedStarredModules;
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
      // console.log(moduleId);
      // console.log(1);
      var targetStudent = await Student.findById(studentId);

      if (!targetStudent) {
        //  console.log(111);
        throw new UserInputError("Invalid input");
      }
      // console.log(2);
      const targetModule = await Module.findById(moduleId);
      const targetPair = await StringIntDict.findOne({
        key: moduleId,
        studentId,
      });
      // console.log(targetModule);
      // console.log(targetPair);
      // console.log(targetPair.length);
      // console.log(3);
      // console.log(targetPair);
      if (targetModule && !targetPair) {
        // console.log(4);
        const newPair = new StringIntDict({
          key: moduleId,
          value: 0,
          studentId,
          createdAt: new Date(),
        });
        await newPair.save();
        targetStudent.modulePointsDict.push(newPair);
        await targetStudent.save();
        // console.log(5);
        // console.log(newPair);
        // console.log(newPair.key);
        return newPair;
      } else if (targetPair) {
        // console.log(6);
        //  console.log(222);
        //  console.log(moduleId);
        // console.log(targetPair);
        // console.log(targetPair.key);
        // console.log(targetPair.key);
        // console.log(targetPair.key);

        return targetPair;
      } else {
        // console.log(7);
        throw new UserInputError("Invalid input");
      }
    },
  },
};
