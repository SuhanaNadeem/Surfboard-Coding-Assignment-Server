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
const moduleResolvers = require("./modules");

const fileResolvers = require("./files");
const AmazonS3URI = require("amazon-s3-uri");

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
      { imageFile, name, description, type, requiredAmount },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      var errors = {};
      const targetBadge = await Badge.findOne({ name });

      if (targetBadge) {
        errors.name = "A badge with this name already exists";
      }
      if (type !== "Question" && type !== "Module") {
        errors.type = "Type must be Question or Module";
      }
      if (requiredAmount <= 0) {
        errors.requiredAmount = "Required amount must be greater than 0";
      }
      if (name == "" || !name) {
        errors.name = "A unique badge name must be selected";
      }
      if (Object.keys(errors).length >= 1) {
        throw new UserInputError("Errors", { errors });
      } else {
        var calculatedLynxImgUrl = "";
        if (imageFile != null) {
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
        }

        const newBadge = new Badge({
          name,
          image: calculatedLynxImgUrl,
          type,
          requiredAmount,
          description,
          adminId: targetAdmin.id,

          createdAt: new Date(),
        });

        await newBadge.save();

        // targetAdmin.badges.push(newBadge.id);
        // await targetAdmin.save();

        return newBadge;
      }
    },

    async editBadge(
      _,
      {
        badgeId,
        newImageFile,
        newName,
        newRequiredAmount,
        newDescription,
        newAdminId,
        newType,
      },
      context
    ) {
      var errors = {};
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        throw new AuthenticationError();
      }
      var targetBadge = await Badge.findById(badgeId);
      var newNameBadge = await Badge.findOne({
        name: newName,
      });
      var newAdmin = await Admin.findById(newAdminId);

      if (!targetBadge) {
        errors.badgeId = "No such badge exists";
      }
      if (newRequiredAmount <= 0) {
        errors.newRequiredAmount = "Required amount must be greater than 0";
      }
      if (
        newName !== undefined &&
        newName !== "" &&
        newName !== targetBadge.name &&
        newNameBadge
      ) {
        errors.newName = "A badge with this name already exists";
      }
      if (
        newAdminId !== undefined &&
        newAdminId !== targetBadge.adminId &&
        !newAdmin &&
        newAdminId !== ""
      ) {
        errors.newAdminId = "No such admin exists";
      }
      if (newAdminId === "" || !newAdminId) {
        errors.newAdminId = "Every badge must have an associated admin";
      }
      if (
        newType !== "" &&
        newType &&
        newType !== "Question" &&
        newType !== "Module"
      ) {
        errors.newType = "Badge type must be Question or Module";
      }
      if (newName === "" || !newName) {
        errors.newName = "Every badge must be named";
      }
      if (Object.keys(errors).length >= 1) {
        throw new UserInputError("Errors", { errors });
      } else {
        if (newName !== undefined && newAdminId !== "") {
          targetBadge.name = newName;
        }
        if (newRequiredAmount !== undefined) {
          targetBadge.requiredAmount = newRequiredAmount;
        }
        if (newDescription !== undefined) {
          targetBadge.description = newDescription;
        }
        if (newAdminId !== undefined && newAdminId !== "") {
          targetBadge.adminId = newAdminId;
        }
        if (newType !== undefined && newType !== "") {
          targetBadge.type = newType;
        }

        if (newImageFile != null) {
          var calculatedLynxImgUrl = "";
          const targetImageUrl = targetBadge.image;
          if (targetImageUrl && targetImageUrl !== "") {
            const { region, bucket, key } = AmazonS3URI(targetImageUrl);
            await fileResolvers.Mutation.deleteLynxFile(
              _,
              {
                fileKey: key,
              },
              context
            );
          }
          const lynxImgS3Object = await fileResolvers.Mutation.uploadLynxFile(
            _,
            {
              file: newImageFile,
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
          targetBadge.image = calculatedLynxImgUrl;
        }

        await targetBadge.save();
        return targetBadge;
      }
    },
    // Add a new badge if the required amount of questions or modules has been completed.
    async handleAddBadge(_, { badgeId, studentId }, context) {
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

      const targetBadge = await Badge.findById(badgeId);

      if (!targetBadge || !targetStudent) {
        throw new UserInputError("Invalid input");
      }
      const requiredAmount = targetBadge.requiredAmount;
      var studentAmount;
      if (targetBadge.type === "Module") {
        studentAmount = targetStudent.completedModules.length;
        if (
          studentAmount === requiredAmount &&
          !targetStudent.badges.includes(badgeId)
        ) {
          await module.exports.Mutation.addBadge(
            _,
            { badgeId, studentId },
            context
          );
          return "Badge Added";
        } else {
          return "Badge Not Added";
        }
      } else if (targetBadge.type === "Question") {
        studentAmount =
          targetStudent.completedQuestions.length +
          targetStudent.completedSkills.length;
        if (
          studentAmount === requiredAmount &&
          !targetStudent.badges.includes(badgeId)
        ) {
          await module.exports.Mutation.addBadge(
            _,
            { badgeId, studentId },
            context
          );
          return "Badge Added";
        } else {
          return "Badge Not Added";
        }
      }
      await targetStudent.save();

      const updatedBadges = targetStudent.badges;
      return updatedBadges;
    },

    async deleteBadge(_, { badgeId }, context) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        throw new AuthenticationError();
      }
      var errors = {};
      const targetBadge = await Badge.findById(badgeId);
      if (!targetBadge) {
        errors.badgeId = "No such badge exists";
      }
      if (Object.keys(errors).length >= 1) {
        throw new UserInputError("Errors", { errors });
      } else {
        try {
          const targetImageUrl = targetBadge.image;
          if (targetImageUrl && targetImageUrl !== "") {
            const { region, bucket, key } = AmazonS3URI(targetImageUrl);
            await fileResolvers.Mutation.deleteLynxFile(
              _,
              {
                fileKey: key,
              },
              context
            );
          }
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
        } catch (err) {
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
