const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError, AuthenticationError } = require("apollo-server");
const fileResolvers = require("./files");

const {
  validateUserRegisterInput,
  validateUserEditInput,
  validateUserLoginInput,
} = require("../../util/validators");
const SECRET_KEY = process.env.SECRET_ADMIN_KEY;
const Admin = require("../../models/Admin");
const Question = require("../../models/Question");
const QuestionTemplate = require("../../models/QuestionTemplate");
const Module = require("../../models/Module");
const Challenge = require("../../models/Challenge");
const Category = require("../../models/Category");
const checkAdminAuth = require("../../util/checkAdminAuth");
const StringStringDict = require("../../models/StringStringDict");
const Student = require("../../models/Student");
const StringIntDict = require("../../models/StringIntDict");
const Badge = require("../../models/Badge");
const { doesS3URLExist } = require("../../util/handleFileUpload");
const AmazonS3URI = require("amazon-s3-uri");
function generateToken(admin) {
  return jwt.sign(
    {
      id: admin.id,
      email: admin.email,
    },
    SECRET_KEY
  );
}

module.exports = {
  Query: {
    async getAdmin(_, {}, context) {
      try {
        const admin = checkAdminAuth(context);
        const targetAdmin = await Admin.findById(admin.id);
        return targetAdmin;
      } catch (error) {
        throw new AuthenticationError();
      }
    },

    async getAdmins(_, {}, context) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        throw new AuthenticationError();
      }
      const admins = await Admin.find();
      if (!admins) {
        throw new UserInputError("No admins", {
          errors: {
            admins: "There are no admins",
          },
        });
      } else {
        return admins;
      }
    },
    async getAdminById(_, { adminId }, context) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        try {
          const mentor = checkMentorAuth(context);
        } catch (error) {
          throw new AuthenticationError();
        }
      }
      const targetAdmin = await Admin.findById(adminId);
      if (!targetAdmin) {
        throw new UserInputError("No such admin", {
          errors: {
            adminId: "There is no admin with this ID",
          },
        });
      } else {
        return targetAdmin;
      }
    },

    async getQuestionsByAdmin(_, { adminId }, context) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        throw new AuthenticationError();
      }
      const admin = await Admin.findById(adminId);
      const questions = await Question.find({ adminId });
      if (!admin) {
        throw new UserInputError("No such admin", {
          errors: {
            adminId: "There is no admin with this ID",
          },
        });
      } else {
        return questions;
      }
    },
    async getQuestionTemplatesByAdmin(_, { adminId }, context) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        throw new AuthenticationError();
      }
      const admin = await Admin.findById(adminId);
      const questionTemplates = await QuestionTemplate.find({ adminId });
      if (!admin) {
        throw new UserInputError("invalid input");
      } else {
        return questionTemplates;
      }
    },
    async getBadgesByAdmin(_, { adminId }, context) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        throw new AuthenticationError();
      }
      const admin = await Admin.findById(adminId);
      var badges = await Badge.find({ adminId });

      if (!admin) {
        throw new UserInputError("No such admin", {
          errors: {
            adminId: "There is no admin with this ID",
          },
        });
      } else {
        return badges;
      }
    },
    async getModulesByAdmin(_, { adminId }, context) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        throw new AuthenticationError();
      }
      const admin = await Admin.findById(adminId);
      const modules = await Module.find({ adminId });
      if (!admin) {
        throw new UserInputError("No such admin", {
          errors: {
            adminId: "There is no admin with this ID",
          },
        });
      } else {
        return modules;
      }
    },
    async getCategoriesByAdmin(_, { adminId }, context) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        throw new AuthenticationError();
      }
      const admin = await Admin.findById(adminId);
      const categories = await Category.find({ adminId });
      if (!admin) {
        throw new UserInputError("No such admin", {
          errors: {
            adminId: "There is no admin with this ID",
          },
        });
      } else {
        return categories;
      }
    },
    async getChallengesByAdmin(_, { adminId }, context) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        throw new AuthenticationError();
      }
      const admin = await Admin.findById(adminId);
      const challenges = await Challenge.find({ adminId });
      if (!admin) {
        throw new UserInputError("No such admin", {
          errors: {
            adminId: "There is no admin with this ID",
          },
        });
      } else {
        return challenges;
      }
    },
    async getStringStringDicts(_, {}, context) {
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
      const stringStringDicts = await StringStringDict.find();

      return stringStringDicts;
    },
    async getStringStringDictsByStudent(_, { studentId }, context) {
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
      const stringStringDicts = await StringStringDict.find({ studentId });

      return stringStringDicts;
    },
    async getStringIntDicts(_, {}, context) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        throw new AuthenticationError();
      }
      const stringIntDicts = await StringIntDict.find();

      return stringIntDicts;
    },
  },

  Mutation: {
    async signupAdmin(_, { name, email, password, confirmPassword }, context) {
      var { valid, errors } = validateUserRegisterInput(
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const checkAdmin = await Admin.findOne({ email });
      if (checkAdmin) {
        throw new UserInputError("Email already exists", {
          errors: {
            email: "An admin with this email already exists",
          },
        });
      }

      password = await bcrypt.hash(password, 12);

      const newAdmin = new Admin({
        name,
        email,
        password,
        createdAt: new Date(),
      });

      const res = await newAdmin.save();

      const token = generateToken(res);

      return { ...res._doc, id: res._id, token };
    },

    async editAdmin(
      _,
      { adminId, newName, newEmail, newPassword, confirmNewPassword },
      context
    ) {
      try {
        var user = checkAdminAuth(context);
      } catch (error) {
        throw new AuthenticationError(error);
      }

      const targetAdmin = await Admin.findById(adminId);

      if (newName === "" || !newName) {
        throw new UserInputError("Admin name must be provided", {
          errors: {
            newName: "Admin name must be provided",
          },
        });
      }
      var { valid, errors } = validateUserEditInput(
        newEmail,
        newPassword,
        confirmNewPassword
      );

      if (!targetAdmin) {
        errors.adminId = "Admin does not exist";
      }
      if (newName === "" || !newName) {
        errors.newName = "Admin name must be provided";
      }
      if (!valid || Object.keys(errors).length >= 1) {
        throw new UserInputError("Errors", { errors });
      }

      newPassword = await bcrypt.hash(newPassword, 12);
      if (newName !== undefined && newName !== "") {
        targetAdmin.name = newName;
      }
      if (newEmail !== undefined && newEmail !== "") {
        targetAdmin.email = newEmail;
      }
      if (newPassword !== undefined && newPassword !== "") {
        targetAdmin.password = newPassword;
      }

      const res = await targetAdmin.save();

      const token = generateToken(res);

      return { ...res._doc, id: res._id, token };
    },

    async loginAdmin(_, { email, password }, context) {
      const { errors, valid } = validateUserLoginInput(email, password);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const admin = await Admin.findOne({ email });

      if (!admin) {
        errors.email = "Admin not found";
        throw new UserInputError("Admin not found", {
          errors,
        });
      }

      const match = await bcrypt.compare(password, admin.password);

      if (!match) {
        errors.password = "Wrong credentials";
        throw new UserInputError("Wrong credentials", {
          errors,
        });
      }

      const token = generateToken(admin);
      return { ...admin._doc, id: admin._id, token };
    },

    async deleteAdmin(_, { adminId }, context) {
      try {
        var user = checkAdminAuth(context);
      } catch (error) {
        try {
          var user = checkMentorAuth(context);
        } catch (error) {
          throw new AuthenticationError(error);
        }
      }
      const targetAdmin = await Admin.findById(adminId);
      if (targetAdmin) {
        await targetAdmin.delete();
        return "Delete Successful";
      } else {
        throw new UserInputError("No such admin", {
          errors: {
            adminId: "There is no admin with this ID",
          },
        });
      }
    },

    async createNewQuestion(
      _,
      {
        imageFile,
        hint,
        moduleId,
        description,
        expectedAnswer,
        questionFormat,
        points,
        videoLink,
        articleLink,
        name,
        type,
        extraLink,
        optionA,
        optionB,
        optionC,
        optionD,
      },
      context
    ) {
      // console.log;
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      var errors = {};

      const targetQuestion = await Question.findOne({
        name,
      });

      var targetModule = await Module.findById(moduleId);

      if (!type || (type !== "Question" && type !== "Skill")) {
        errors.type = "Type must be question or skill";
      }
      if (!targetModule) {
        errors.moduleId = "A valid module is required";
      }
      if (type === "Question" && (!questionFormat || questionFormat === "")) {
        errors.questionFormat =
          "A valid question format is required for questions";
      }
      if (
        questionFormat === "Multiple Choice" &&
        (optionA === "" ||
          !optionA ||
          optionB === "" ||
          !optionB ||
          optionC === "" ||
          !optionC ||
          optionD === "" ||
          !optionD)
      ) {
        errors.questionFormat =
          "All multiple choice questions must have four options";
      }
      if (
        questionFormat === "Multiple Choice" &&
        expectedAnswer !== "A" &&
        expectedAnswer !== "B" &&
        expectedAnswer !== "C" &&
        expectedAnswer !== "D"
      ) {
        errors.expectedAnswer =
          "Multiple choice questions' answers must be A, B, C, or D";
      }
      if (targetQuestion) {
        errors.name = "A question with this name already exists";
      }
      if (name == "" || !name) {
        errors.name = "A unique question name must be selected";
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

        const newQuestion = new Question({
          image: calculatedLynxImgUrl,
          description,
          expectedAnswer,
          hint,
          questionFormat,
          points,
          moduleId,
          videoLink,
          articleLink,
          name,
          type,
          adminId: targetAdmin.id,
          extraLink,
          optionA,
          optionB,
          optionC,
          optionD,
          createdAt: new Date(),
        });
        await newQuestion.save();

        targetModule.questions.push(newQuestion.id);
        await targetModule.save();

        // targetAdmin.questions.push(newQuestion.id);
        // await targetAdmin.save();

        return newQuestion;
      }
    },

    async createNewQuestionTemplate(
      _,
      { name, categoryId, inputFields },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      const targetQuestionTemplate = await QuestionTemplate.findOne({
        name,
      });
      const targetCategory = await Category.findById(categoryId);

      if (!targetCategory) {
        throw new UserInputError("Invalid input");
      } else if (!targetQuestionTemplate) {
        const newQuestionTemplate = new QuestionTemplate({
          categoryId,
          name,
          inputFields,
          adminId: targetAdmin.id,
          createdAt: new Date(),
        });

        await newQuestionTemplate.save();

        // targetAdmin.questionTemplates.push(newQuestionTemplate.id);
        // await targetAdmin.save();

        return newQuestionTemplate;
      } else {
        return targetQuestionTemplate;
      }
    },

    async createNewModule(_, { name, categoryId, imageFile }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      var errors = {};
      const targetModule = await Module.findOne({ name });

      const questions = [];
      const comments = [];

      const targetCategory = await Category.findById(categoryId);
      if (!targetCategory) {
        errors.categoryId = "A valid category must be selected";
      }
      if (targetModule) {
        errors.name = "A module with this name already exists";
      }
      if (name == "" || !name) {
        errors.name = "A unique name must be selected";
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

        const newModule = new Module({
          name,
          categoryId,
          questions,
          comments,
          image: calculatedLynxImgUrl,

          adminId: targetAdmin.id,
          createdAt: new Date(),
        });

        await newModule.save();
        // targetAdmin.modules.push(newModule.id);
        // await targetAdmin.save();
        return newModule;
      }
    },

    async createNewChallenge(
      _,
      { name, challengeDescription, categoryId, imageFile, extraLink, dueDate },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      var errors = {};
      const targetChallenge = await Challenge.findOne({ name });
      const targetCategory = await Category.findById(categoryId);
      if (!targetCategory) {
        errors.categoryId = "A valid category must be selected";
      }
      if (targetChallenge) {
        errors.name = "A challenge with this name already exists";
      }
      if (name == "" || !name) {
        errors.name = "A unique name must be selected";
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

        const newChallenge = new Challenge({
          name,
          challengeDescription,
          categoryId,
          image: calculatedLynxImgUrl,
          dueDate,
          extraLink,
          adminId: targetAdmin.id,
          createdAt: new Date(),
        });

        await newChallenge.save();
        // await targetAdmin.challenges.push(newChallenge.id);
        // await targetAdmin.save();
        return newChallenge;
      }
    },

    async createNewCategory(_, { name }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      var errors = {};
      const targetCategory = await Category.findOne({ name });
      if (targetCategory) {
        errors.name = "A category with this name already exists";
      }
      if (name == "" || !name) {
        errors.name = "A unique name must be selected";
      }
      if (Object.keys(errors).length >= 1) {
        throw new UserInputError("Errors", { errors });
      } else {
        const newCategory = new Category({
          name,
          adminId: targetAdmin.id,
          createdAt: new Date(),
        });
        await newCategory.save();
        // targetAdmin.categories.push(newCategory.id);
        // await targetAdmin.save();
        return newCategory;
      }
    },
    async editModule(
      _,
      { moduleId, newName, newCategoryId, newAdminId, newImageFile },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        throw new AuthenticationError();
      }
      var errors = {};
      var targetModule = await Module.findById(moduleId);
      var newNameModule = await Module.findOne({
        name: newName,
      });
      var newCategory = await Category.findById(newCategoryId);
      var newAdmin = await Admin.findById(newAdminId);

      if (!targetModule) {
        errors.moduleId = "No such module exists";
      }
      if (
        newName !== undefined &&
        newName !== targetModule.name &&
        newNameModule
      ) {
        errors.newName = "A module with this name already exists";
      }
      if (
        newCategoryId !== undefined &&
        newCategoryId !== targetModule.categoryId &&
        !newCategory
      ) {
        errors.newCategoryId = "No such category exists";
      }
      if (
        newAdminId !== undefined &&
        newAdminId !== targetModule.adminId &&
        !newAdmin
      ) {
        errors.newAdminId = "No such admin exists";
      }
      if (!newAdminId || newAdminId == "") {
        errors.newAdminId = "Every module must have an associated admin";
      }
      if (Object.keys(errors).length >= 1) {
        throw new UserInputError("Errors", { errors });
      } else {
        if (newName !== undefined) {
          targetModule.name = newName;
        }
        if (newCategoryId !== undefined) {
          targetModule.categoryId = newCategoryId;
        }
        if (newAdminId !== undefined) {
          targetModule.adminId = newAdminId;
        }
        if (newImageFile != null) {
          var calculatedLynxImgUrl = "";
          const targetImageUrl = targetModule.image;
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
          targetModule.image = calculatedLynxImgUrl;
        }

        await targetModule.save();
        return targetModule;
      }
    },

    async editQuestion(
      _,
      {
        questionId,
        moduleId,
        newImageFile,
        newHint,
        newDescription,
        newExpectedAnswer,
        newModuleId,
        newPoints,
        newVideoLink,
        newArticleLink,
        newName,
        newAdminId,
        newExtraLink,
        newOptionA,
        newOptionB,
        newOptionC,
        newOptionD,
      },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        throw new AuthenticationError();
      }
      var errors = {};
      var targetQuestion = await Question.findById(questionId);

      var currentModule = await Module.findById(moduleId);
      var newModule = await Module.findById(newModuleId);
      var newNameQuestion = await Question.findOne({
        name: newName,
      });
      var newDescriptionQuestion = await Question.findOne({
        description: newDescription,
      });
      var newAdmin = await Admin.findById(newAdminId);

      if (!targetQuestion) {
        errors.questionId = "No such question exists";
      }
      if (!currentModule) {
        errors.moduleId = "No such question exists";
      }
      if (
        newName !== undefined &&
        newName !== "" &&
        newName !== targetQuestion.name &&
        newNameQuestion
      ) {
        errors.newName = "A question with this name already exists";
      }
      if (!newName || newName === "") {
        errors.newName = "Every question must have a name";
      }
      if (
        newDescription !== undefined &&
        newDescription !== "" &&
        newDescription !== targetQuestion.description &&
        newDescriptionQuestion
      ) {
        errors.newDescription =
          "A question with this description already exists";
      }
      if (newAdminId === "" || !newAdminId) {
        errors.newAdminId = "An admin must be provided";
      }
      if (
        newAdminId !== undefined &&
        newAdminId !== "" &&
        newAdminId !== targetQuestion.adminId &&
        !newAdmin
      ) {
        errors.newAdminId = "No such admin exists";
      }
      if (
        targetQuestion.questionFormat === "Multiple Choice" &&
        (newOptionA === "" ||
          newOptionA === undefined ||
          newOptionB === "" ||
          newOptionB === undefined ||
          newOptionC === "" ||
          newOptionC === undefined ||
          newOptionD === "" ||
          newOptionD === undefined)
      ) {
        errors.questionFormat =
          "All four options must be provided for multiple choice questions";
      }
      if (
        targetQuestion.questionFormat === "Multiple Choice" &&
        (!newExpectedAnswer ||
          newExpectedAnswer === "" ||
          (newExpectedAnswer !== "A" &&
            newExpectedAnswer !== "B" &&
            newExpectedAnswer !== "C" &&
            newExpectedAnswer !== "D"))
      ) {
        errors.newExpectedAnswer =
          "Expected answer must be A, B, C, or D for multiple choice questions";
      }
      if (
        newModuleId &&
        newModuleId !== targetQuestion.moduleId &&
        !newModule
      ) {
        errors.newModuleId = "A valid module must be selected";
      }
      if (Object.keys(errors).length >= 1) {
        throw new UserInputError("Errors", { errors });
      } else {
        if (newDescription !== undefined && newDescription !== "") {
          targetQuestion.description = newDescription;
        }
        if (newExpectedAnswer !== undefined) {
          targetQuestion.expectedAnswer = newExpectedAnswer;
        }
        if (newHint !== undefined) {
          targetQuestion.hint = newHint;
        }
        if (newPoints !== undefined) {
          targetQuestion.points = newPoints;
        }
        if (newVideoLink !== undefined) {
          targetQuestion.videoLink = newVideoLink;
        }
        if (newArticleLink !== undefined) {
          targetQuestion.articleLink = newArticleLink;
        }

        if (newName !== undefined && newName !== "") {
          targetQuestion.name = newName;
        }
        if (newAdminId !== undefined && newAdminId !== "") {
          targetQuestion.adminId = newAdminId;
        }
        if (newOptionA !== undefined) {
          targetQuestion.optionA = newOptionA;
        }
        if (newOptionB !== undefined) {
          targetQuestion.optionB = newOptionB;
        }
        if (newOptionC !== undefined) {
          targetQuestion.optionC = newOptionC;
        }
        if (newOptionD !== undefined) {
          targetQuestion.optionD = newOptionD;
        }
        if (newExtraLink !== undefined) {
          targetQuestion.extraLink = newExtraLink;
        }

        if (newModuleId !== undefined && newModuleId != moduleId && newModule) {
          const index = currentModule.questions.indexOf(questionId);
          currentModule.questions.splice(index, 1);
          await currentModule.save();
          await newModule.questions.push(questionId);
          await newModule.save();
          targetQuestion.moduleId = newModuleId;
        }

        if (newImageFile != null) {
          var calculatedLynxImgUrl = "";
          const targetImageUrl = targetQuestion.image;
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
          targetQuestion.image = calculatedLynxImgUrl;
        }

        await targetQuestion.save();
        return targetQuestion;
      }
    },

    async editQuestionTemplate(
      _,
      {
        questionTemplateId,
        newName,
        newCategoryId,
        newInputFields,
        newAdminId,
      },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      var targetQuestionTemplate = await QuestionTemplate.findById(
        questionTemplateId
      );
      var newNameQuestionTemplate = await QuestionTemplate.findOne({
        name: newName,
      });
      var newCategory = await Category.findById(newCategoryId);
      var newAdmin = await Admin.findById(newAdminId);
      if (
        !targetQuestionTemplate ||
        (newName !== undefined &&
          newName !== "" &&
          newName !== targetQuestionTemplate.name &&
          newNameQuestionTemplate) ||
        (newCategoryId !== undefined &&
          newCategoryId !== "" &&
          newCategoryId !== targetQuestionTemplate.categoryId &&
          !newCategory) ||
        (newAdminId !== undefined &&
          newAdminId !== "" &&
          newAdminId !== targetQuestionTemplate.adminId &&
          !newAdmin)
      ) {
        throw new UserInputError("Invalid input");
      } else {
        if (newName !== undefined && newName !== "") {
          targetQuestionTemplate.name = newName;
        }
        if (newInputFields !== undefined) {
          targetQuestionTemplate.inputFields = newInputFields;
        }
        if (newCategoryId !== undefined && newCategoryId !== "") {
          targetQuestionTemplate.categoryId = newCategoryId;
        }
        if (newAdminId !== undefined && newAdminId !== "") {
          targetQuestionTemplate.adminId = newAdminId;
        }
        await targetQuestionTemplate.save();
        return targetQuestionTemplate;
      }
    },

    async editChallenge(
      _,
      {
        challengeId,
        newName,
        newCategoryId,
        newChallengeDescription,
        newImageFile,
        newAdminId,
        newExtraLink,
        newDueDate,
      },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        throw new AuthenticationError();
      }
      var errors = {};
      var targetChallenge = await Challenge.findById(challengeId);
      var newNameChallenge = await Challenge.findOne({
        name: newName,
      });
      var newCategory = await Category.findById(newCategoryId);
      var newAdmin = await Admin.findById(newAdminId);
      if (!targetChallenge) {
        errors.challengeId = "No such challenge exists";
      }
      if (
        newName !== undefined &&
        newName !== targetChallenge.name &&
        newNameChallenge &&
        newName !== ""
      ) {
        errors.newName = "A challenge with this name already exists";
      }
      if (!newName || newName === "") {
        errors.newName = "Every challenge must have a name";
      }
      if (!newAdminId || newAdminId === "") {
        errors.newAdminId = "Every challenge must have an associated admin";
      }
      if (
        newCategoryId !== undefined &&
        newCategoryId !== targetChallenge.categoryId &&
        !newCategory &&
        newCategoryId !== ""
      ) {
        errors.newCategoryId = "No such category exists";
      }
      if (
        newAdminId !== undefined &&
        newAdminId !== targetChallenge.adminId &&
        !newAdmin &&
        newAdminId !== ""
      ) {
        errors.newAdminId = "No such admin exists";
      }
      if (Object.keys(errors).length >= 1) {
        throw new UserInputError("Errors", { errors });
      } else {
        if (newCategoryId !== undefined) {
          targetChallenge.categoryId = newCategoryId;
        }
        if (newName !== undefined && newName !== "") {
          targetChallenge.name = newName;
        }
        if (newCategoryId !== undefined && newCategoryId !== "") {
          targetChallenge.categoryId = newCategoryId;
        }
        if (newChallengeDescription !== undefined) {
          targetChallenge.challengeDescription = newChallengeDescription;
        }

        if (newAdminId !== undefined && newAdminId !== "") {
          targetChallenge.adminId = newAdminId;
        }
        if (newExtraLink !== undefined) {
          targetChallenge.extraLink = newExtraLink;
        }
        if (newDueDate !== undefined) {
          targetChallenge.dueDate = newDueDate;
        }

        if (newImageFile != null) {
          var calculatedLynxImgUrl = "";
          const targetImageUrl = targetChallenge.image;
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
          targetChallenge.image = calculatedLynxImgUrl;
        }
        await targetChallenge.save();
        return targetChallenge;
      }
    },
    async editCategory(_, { categoryId, newName, newAdminId }, context) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        throw new AuthenticationError();
      }
      var errors = {};
      var targetCategory = await Category.findById(categoryId);
      var newNameCategory = await Category.findOne({
        name: newName,
      });
      var newAdmin = await Admin.findById(newAdminId);

      if (!targetCategory) {
        errors.categoryId = "No such category exists";
      }
      if (
        newName !== undefined &&
        newName !== targetCategory.name &&
        newNameCategory
      ) {
        errors.newName = "A category with this name already exists";
      }
      if (!newName || newName == "") {
        errors.newName = "Every category must have a name";
      }
      if (!newAdminId || newAdminId == "") {
        errors.newAdminId = "Every category must have an associated admin";
      }
      if (
        newAdminId !== undefined &&
        newAdminId !== targetCategory.adminId &&
        !newAdmin
      ) {
        errors.newAdminId = "No such admin exists";
      }

      if (Object.keys(errors).length >= 1) {
        throw new UserInputError("Errors", { errors });
      } else {
        if (newName !== undefined) {
          targetCategory.name = newName;
        }
        if (newAdminId !== undefined) {
          targetCategory.adminId = newAdminId;
        }
        await targetCategory.save();
        return targetCategory;
      }
    },
    async deleteModule(_, { moduleId }, context) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        throw new AuthenticationError();
      }
      var errors = {};
      const targetModule = await Module.findById(moduleId);
      if (!targetModule) {
        errors.moduleId = "No such module exists";
      }
      if (Object.keys(errors).length >= 1) {
        throw new UserInputError("Errors", { errors });
      } else {
        try {
          const targetImageUrl = targetModule.image;
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
          await targetModule.delete();
          const updatedModules = await Module.find();
          return updatedModules;
        } catch (err) {
          await targetModule.delete();
          const updatedModules = await Module.find();
          return updatedModules;
        }
      }
    },
    async deleteStringStringDict(_, { stringStringDictId }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      const targetStringStringDict = await StringStringDict.findById(
        stringStringDictId
      );
      if (!targetStringStringDict) {
        throw new UserInputError("Invalid input");
      } else {
        var allStudents = await Student.find();
        allStudents.forEach(async function (targetStudent) {
          const index = targetStudent.quesAnsDict.indexOf({
            id: stringStringDictId,
          });
          targetStudent.quesAnsDict.splice(index, 1);
          await targetStudent.save();
        });
        await targetStringStringDict.delete();
        const updatedStringStringDicts = await StringStringDict.find();
        return updatedStringStringDicts;
      }
    },
    async deleteStringIntDict(_, { stringIntDictId }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      const targetStringIntDict = await StringIntDict.findById(stringIntDictId);
      const moduleId = targetStringIntDict.key;
      if (!targetStringIntDict) {
        throw new UserInputError("Invalid input");
      } else {
        var allStudents = await Student.find();
        allStudents.forEach(async function (targetStudent) {
          const index1 = targetStudent.modulePointsDict.indexOf({
            id: stringIntDictId,
          });
          targetStudent.modulePointsDict.splice(index1, 1);
          await targetStudent.save();
          if (targetStudent.completedModules.includes(moduleId)) {
            const index2 = targetStudent.completedModules.indexOf(moduleId);
            targetStudent.completedModules.splice(index2, 1);
            await targetStudent.save();
          }
          if (targetStudent.inProgressModules.includes(moduleId)) {
            const index3 = targetStudent.inProgressModules.indexOf(moduleId);
            targetStudent.inProgressModules.splice(index3, 1);
            await targetStudent.save();
          }
        });

        await targetStringIntDict.delete();
        const updatedStringIntDicts = await StringIntDict.find();
        return updatedStringIntDicts;
      }
    },
    async changeQuestions(_, {}, context) {
      const allQuestions = await Question.find();
      const cadModule = await Module.findById("BCL5QTRX7M");
      const progModule = await Module.findById("X2YC2OLUMW");
      const elecModule = await Module.findById("IF1DW21FVY");
      // console.log(cadModule);
      // console.log(progModule);
      // console.log(elecModule);
      for (var question of allQuestions) {
        if (question.moduleId === "BCL5QTRX7M") {
          // console.log("CAD");
          // console.log(question.name);
          cadModule.questions.push(question.id);
          await cadModule.save();
        } else if (question.moduleId === "X2YC2OLUMW") {
          // console.log("Prog");
          // console.log(question.name);

          progModule.questions.push(question.id);
          await progModule.save();
        } else if (question.moduleId === "IF1DW21FVY") {
          // console.log("Electrical");
          // console.log(question.name);

          elecModule.questions.push(question.id);
          await elecModule.save();
        }
      }
      return "done";
    },
    async deleteQuestion(_, { questionId }, context) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        throw new AuthenticationError();
      }
      // console.log("enter");
      const targetQuestion = await Question.findById(questionId);
      const targetModule = await Module.findById(targetQuestion.moduleId);
      // console.log(targetQuestion);
      // console.log(targetQuestion.moduleId);
      // console.log(targetModule);
      if (!targetQuestion || !targetModule) {
        // if (!targetQuestion) {
        // console.log("not");
        throw new UserInputError("Invalid input");
      } else {
        // console.log("here");
        const targetImageUrl = targetQuestion.image;
        if (targetImageUrl && targetImageUrl !== "") {
          // console.log(1);
          try {
            // console.log(2);
            const { region, bucket, key } = AmazonS3URI(targetImageUrl);
            await fileResolvers.Mutation.deleteLynxFile(
              _,
              {
                fileKey: key,
              },
              context
            );
            const index = targetModule.questions.indexOf(questionId);
            targetModule.questions.splice(index, 1);
            await targetModule.save();
            await targetQuestion.delete();
            await targetModule.save();
            const updatedQuestions = await Question.find();
            return updatedQuestions;
          } catch (err) {
            // console.log(3);
            const index = targetModule.questions.indexOf(questionId);
            targetModule.questions.splice(index, 1);
            await targetModule.save();

            await targetQuestion.delete();
            await targetModule.save();
            const updatedQuestions = await Question.find();
            return updatedQuestions;
          }
        } else {
          const index = targetModule.questions.indexOf(questionId);
          targetModule.questions.splice(index, 1);
          await targetModule.save();

          await targetQuestion.delete();
          await targetModule.save();
          const updatedQuestions = await Question.find();
          return updatedQuestions;
        }
      }
    },

    async deleteQuestionTemplate(_, { questionTemplateId }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      const targetQuestionTemplate = await QuestionTemplate.findById(
        questionTemplateId
      );
      if (!targetQuestionTemplate) {
        throw new UserInputError("Invalid input");
      } else {
        const index = targetAdmin.questionTemplates.indexOf(questionTemplateId);
        targetAdmin.questionTemplates.splice(index, 1);
        await targetAdmin.save();
        await targetQuestionTemplate.delete();
        const updatedQuestionTemplates = targetAdmin.questionTemplates;
        return updatedQuestionTemplates;
      }
    },
    async deleteChallenge(_, { challengeId }, context) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        throw new AuthenticationError();
      }
      var errors = {};
      const targetChallenge = await Challenge.findById(challengeId);
      if (!targetChallenge) {
        errors.challengeId = "No such challenge exists";
      }
      if (Object.keys(errors).length >= 1) {
        throw new UserInputError("Errors", { errors });
      } else {
        const targetImageUrl = targetChallenge.image;
        if (targetImageUrl && targetImageUrl !== "") {
          try {
            const { region, bucket, key } = AmazonS3URI(targetImageUrl);
            await fileResolvers.Mutation.deleteLynxFile(
              _,
              {
                fileKey: key,
              },
              context
            );
            await targetChallenge.delete();
            const updatedChallenges = await Challenge.find();
            return updatedChallenges;
          } catch (err) {
            await targetChallenge.delete();
            const updatedChallenges = await Challenge.find();
            return updatedChallenges;
          }
        }
      }
    },
    async deleteCategory(_, { categoryId }, context) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        // console.log(error);
        throw new AuthenticationError();
      }
      const targetCategory = await Category.findById(categoryId);
      if (!targetCategory) {
        throw new UserInputError("Invalid input");
      } else {
        await targetCategory.delete();
        const updatedCategories = await Category.find();
        return updatedCategories;
      }
    },
  },
};
