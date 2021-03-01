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
      const targetBadge = await Badge.findOne({ name });

      if (
        !targetBadge &&
        (type === "Question" || type === "Module") &&
        requiredAmount > 0
      ) {
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
      } else {
        return targetBadge;
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
        (newType !== "" &&
          newType &&
          newType !== "Question" &&
          newType !== "Module") === true
      ) {
        throw new UserInputError("Invalid input");
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

      if (
        !targetBadge ||
        targetStudent.badges.includes(badgeId) ||
        !targetStudent
      ) {
        throw new UserInputError("Invalid input");
      }
      const requiredAmount = targetBadge.requiredAmount;
      var studentAmount;
      if (targetBadge.type === "Module") {
        studentAmount = targetStudent.completedModules.length;
        if (studentAmount === requiredAmount) {
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
        studentAmount = targetStudent.quesAndDict.length;
        if (studentAmount === requiredAmount) {
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
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      const targetBadge = await Badge.findById(badgeId);
      if (!targetBadge) {
        throw new UserInputError("Invalid input");
      } else {
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
