const checkMentorAuth = require("../../util/checkMentorAuth");
const checkStudentAuth = require("../../util/checkStudentAuth");
const checkAdminAuth = require("../../util/checkAdminAuth");

const Admin = require("../../models/Admin");
const Student = require("../../models/Student");
const Mentor = require("../../models/Mentor");

const { UserInputError, AuthenticationError } = require("apollo-server");
const Badge = require("../../models/Badge");
const Question = require("../../models/Question");
const Module = require("../../models/Module");
const Category = require("../../models/Category");

const fileResolvers = require("./files");

module.exports = {
  Query: {
    async getBadges(_, {}, context) {
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

      const badges = await Badge.find();

      return badges;
    },
    async getBadgesByStudent(_, { studentId }, context) {
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
      if (!targetStudent) {
        throw new UserInputError("Invalid input");
      } else {
        const badgeIds = targetStudent.badges;
        const badges = await Badge.find({
          _id: { $in: badgeIds },
        });
        return badges;
      }
    },

    async getBadgeById(_, { badgeId }, context) {
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

      const targetBadge = await Badge.findById(badgeId);
      if (!targetBadge) {
        throw new UserInputError("Invalid input");
      } else {
        return targetBadge;
      }
    },
  },

  Mutation: {
    async createNewBadge(
      _,
      {
        imageFile,
        name,
        description,
        questionId,
        moduleId,
        categoryId,
        points,
      },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }

      const targetBadge = await Badge.findOne({ name });
      const targetQuestion = await Question.findById(questionId);
      const targetModule = await Module.findById(moduleId);
      const targetCategory = await Category.findById(categoryId);

      if (!targetBadge && (targetQuestion || targetModule || targetCategory)) {
        var calculatedLynxImgUrl = "";
        const lynxImgS3Object = await fileResolvers.Mutation.uploadLynxFile(
          _,
          {
            file: imageFile,
          },
          context
        );

        if (!lynxImgS3Object || !lynxImgS3Object.Location) {
          valid = false;
          throw new UserInputError("Lynx S3 Object was not valid", {
            errors: {
              lynxImgLogo: "Lynx upload error, try again",
            },
          });
        }

        calculatedLynxImgUrl = lynxImgS3Object.Location;

        const newBadge = new Badge({
          name,
          image: calculatedLynxImgUrl,
          questionId,
          moduleId,
          categoryId,
          points,
          description,
          adminId: targetAdmin.id,

          createdAt: new Date(),
        });

        await newBadge.save();

        // targetAdmin.badges.push(newBadge.id);
        // await targetAdmin.save();

        return newBadge;
      } else {
        return targetBadge;
      }
    },

    async editBadge(
      _,
      {
        badgeId,
        newImage,
        newName,
        newPoints,
        newDescription,
        newAdminId,
        newModuleId,
        newCategoryId,
        newQuestionId,
      },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      var targetBadge = await Badge.findById(badgeId);
      var newNameBadge = await Badge.findOne({
        name: newName,
      });
      var newAdmin = await Admin.findById(newAdminId);
      const targetQuestion = await Question.findById(newQuestionId);
      const targetModule = await Module.findById(newModuleId);
      const targetCategory = await Category.findById(newCategoryId);

      if (
        !targetBadge ||
        (newName !== undefined &&
          newName !== "" &&
          newName !== targetBadge.name &&
          newNameBadge) === true ||
        (newAdminId !== undefined &&
          newAdminId !== targetBadge.adminId &&
          !newAdmin &&
          newAdminId !== "") === true ||
        (newQuestionId !== undefined &&
          newQuestionId !== targetBadge.questionId &&
          !targetQuestion &&
          newQuestionId !== "") === true ||
        (newModuleId !== undefined &&
          newModuleId !== targetBadge.moduleId &&
          !targetModule &&
          newModuleId !== "") === true ||
        (newCategoryId !== undefined &&
          newCategoryId !== targetBadge.categoryId &&
          !targetCategory &&
          newCategoryId !== "") === true
      ) {
        throw new UserInputError("Invalid input");
      } else {
        if (newName !== undefined && newAdminId !== "") {
          targetBadge.name = newName;
        }
        if (newPoints !== undefined) {
          targetBadge.points = newPoints;
        }
        if (newDescription !== undefined) {
          targetBadge.description = newDescription;
        }
        if (newImage !== undefined) {
          targetBadge.image = newImage;
        }
        if (newAdminId !== undefined && newAdminId !== "") {
          targetBadge.adminId = newAdminId;
        }
        if (newQuestionId !== undefined && newQuestionId !== "") {
          targetBadge.questionId = newQuestionId;
        }
        if (newModuleId !== undefined && newModuleId !== "") {
          targetBadge.moduleId = newModuleId;
        }
        if (newCategoryId !== undefined && newCategoryId !== "") {
          targetBadge.categoryId = newCategoryId;
        }
        await targetBadge.save();
        return targetBadge;
      }
    },
    async handleAddBadge(_, { badgeId, studentId }, context) {
      try {
        const student = checkStudentAuth(context);
      } catch (error) {
        throw new Error(error);
      }
      var targetStudent = await Student.findById(studentId);

      const targetBadge = await Badge.findById(badgeId);
      if (!targetBadge) {
        throw new UserInputError("Invalid input");
      } else if (!targetStudent.badges.includes(badgeId)) {
        await targetStudent.badges.push(badgeId);
        await targetStudent.save();
      }
      const updatedBadges = targetStudent.badges;
      return updatedBadges;
    },

    async deleteBadge(_, { badgeId }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      const targetBadge = await Badge.findById(badgeId);
      if (!targetBadge) {
        throw new UserInputError("Invalid input");
      } else {
        const students = await Student.find();
        var index;
        for (var targetStudent of students) {
          if (targetStudent.badges.includes(badgeId)) {
            index = targetStudent.badges.indexOf(badgeId);
            targetStudent.badges.splice(index, 1);
            targetStudent.save();
          }
        }
        await targetBadge.delete();
        const updatedBadges = await Badge.find();
        return updatedBadges;
      }
    },
    async addBadge(_, { studentId, badgeId }, context) {
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
      if (!targetStudent || targetStudent.badges.includes(badgeId)) {
        throw new UserInputError("Invalid input");
      } else {
        targetStudent.badges.push(badgeId);
        await targetStudent.save();
        const badgeIds = targetStudent.badges;
        const badges = await Badge.find({
          _id: { $in: badgeIds },
        });
        return badges;
      }
    },
  },
};
