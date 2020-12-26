const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError, AuthenticationError } = require("apollo-server");

const {
  validateUserRegisterInput,
  validateUserLoginInput,
} = require("../../util/validators");
const SECRET_KEY = process.env.SECRET_ADMIN_KEY;
const Admin = require("../../models/Admin");
const checkAdminAuth = require("../../util/checkAdminAuth");
function generateToken(admin) {
  return jwt.sign(
    {
      id: admin.id,
      email: admin.email,
    },
    SECRET_KEY
    //{ expiresIn: "3h" }
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
        throw new Error(error);
      }
    },
  },

  Mutation: {
    async signupAdmin(_, { email, password, confirmPassword }, context) {
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
        email,
        password,
        createdAt: new Date(),
      });

      const res = await newAdmin.save();

      const token = generateToken(res);

      return { ...res._doc, id: res._id, token };
    },

    async loginAdmin(_, {}, context) {
      const { errors, valid } = validateUserLoginInput(email, password);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const admin = await Admin.findOne({ email });

      if (!admin) {
        errors.email = "Admin not found";
        throw new UserInputError("Admin not found", { errors });
      }

      const match = await bcrypt.compare(password, admin.password);

      if (!match) {
        errors.password = "Wrong credentials";
        throw new UserInputError("Wrong credentials", { errors });
      }

      const token = generateToken(admin);
      return { ...admin._doc, id: admin._id, token };
    },

    async createNewQuestion(
      _,
      { image, infoProvided, expectedAnswers, hint, questionTemplateId },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new Error(error);
      }

      targetQuestion = Admin.findOne(infoProvided);

      // TODO where will the id come from
      if (!targetAdmin.modules.questions.includes(targetQuestion.id)) {
        const newQuestion = new Question({
          image,
          infoProvided,
          expectedAnswers,
          hint,
          questionTemplateId,
          createdAt: new Date(),
        });
        await newQuestion.save();
        targetAdmin.modules.questions.push(newQuestion.id);
        await targetAdmin.modules.questions.save();

        const updatedQuestions = await targetAdmin.modules.questions;
        return updatedQuestions;
      }
    },

    async createNewQuestionTemplate(
      _,
      { category, type, inputFields },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new Error(error);
      }

      targetQuestionTemplate = Admin.findOne(inputFields);

      // TODO where will the id come from
      if (!targetAdmin.questionTemplates.includes(targetQuestionTemplate.id)) {
        const newQuestionTemplate = new QuestionTemplate({
          category,
          type,
          inputFields,
          createdAt: new Date(),
        });
        targetAdmin.questionTemplates.push(newQuestionTemplate.id);
        await targetAdmin.questionTemplates.save();

        const updatedQuestionTemplates = await targetAdmin.questionTemplates;
        return updatedQuestionTemplates;
      }
    },

    async createNewModule(_, { type, categoryId, format }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new Error(error);
      }
      const newModule = new Module({
        type,
        categoryId,
        format,
        createdAt: new Date(),
      });

      targetAdmin.modules.push(newModule);
      await targetAdmin.modules.save();
      const updatedModules = await targetAdmin.modules;
      return updatedModules;

      // const res = await newModule.save();

      // TODO whats the point of the following line
      // return { ...res._doc, id: res._id };
    },

    async createNewChallenge(_, { infoProvided, categoryId, image }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new Error(error);
      }
      const newChallenge = new Challenge({
        infoProvided,
        categoryId,
        image,
        createdAt: new Date(),
      });

      targetAdmin.challenges.push(newChallenge);
      await targetAdmin.challenges.save();
      const updatedChallenges = await targetAdmin.challenges;
      return updatedChallenges;

      // const res = await newModule.save();

      // TODO whats the point of the following line
      // return { ...res._doc, id: res._id };
    },

    async editModule(
      _,
      { moduleId, newType, newCategoryId, newFormat },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new Error(error);
      }
      var targetModule = await targetAdmin.modules.findById(moduleId);

      // TODO replacing existing properties
      targetModule.categoryId = newCategoryId;
      targetModule.format = newFormat;
      targetModule.type = newType;

      await targetModule.save();
      return targetModule;

      // const res = await newModule.save();

      // TODO whats the point of the following line
      // return { ...res._doc, id: res._id };
    },

    async editQuestion(
      _,
      {
        questionId,
        newImage,
        newInfoProvided,
        newExpectedAnswers,
        newHint,
        newQuestionTemplateId,
      },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new Error(error);
      }
      var targetQuestion = await targetAdmin.modules.questions.findById(
        questionId
      );

      // TODO replacing existing properties
      targetQuestion.image = newImage;
      targetQuestion.infoProvided = newInfoProvided;
      targetQuestion.expectedAnswers = newExpectedAnswers;
      targetQuestion.hint = newHint;
      targetQuestion.questionTemplateId = newQuestionTemplateId;

      await targetQuestion.save();
      return targetQuestion;

      // const res = await newModule.save();

      // TODO whats the point of the following line
      // return { ...res._doc, id: res._id };
    },

    async editQuestionTemplate(
      _,
      { questionTemplateId, newCategory, newInputFields, newType },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new Error(error);
      }
      var targetQuestionTemplate = await targetAdmin.modules.questions.findById(
        questionTemplateId
      );

      // TODO replacing existing properties
      targetQuestionTemplate.category = newCategory;
      targetQuestionTemplate.inputFields = newInputFields;
      targetQuestionTemplate.type = newType;
      await targetQuestionTemplate.save();

      return targetQuestionTemplate;

      // const res = await newModule.save();

      // TODO whats the point of the following line
      // return { ...res._doc, id: res._id };
    },

    async editChallenge(
      _,
      { challengeId, newInfoProvided, newImage },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new Error(error);
      }
      var targetChallenge = await targetAdmin.challenges.findById(challengeId);

      // TODO replacing existing properties
      targetChallenge.categoryId = newCategoryId;
      targetChallenge.infoProvided = newInfoProvided;
      targetChallenge.image = newImage;

      await targetChallenge.save();
      return targetChallenge;

      // const res = await newModule.save();

      // TODO whats the point of the following line
      // return { ...res._doc, id: res._id };
    },

    async deleteModule(_, { moduleId }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new Error(error);
      }
      const targetModule = await targetAdmin.modules.findById(moduleId);
      await targetModule.delete();

      const updatedModules = await targetAdmin.modules;
      return updatedModules;
    },

    async deleteQuestion(_, { questionId }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new Error(error);
      }
      const targetQuestion = await targetAdmin.modules.questions.findById(
        questionId
      );
      await targetQuestion.delete();

      const updatedQuestions = await targetAdmin.modules.questions;
      return updatedQuestions;
    },

    async deleteQuestionTemplate(_, { questionTemplateId }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new Error(error);
      }
      const targetQuestionTemplate = await targetAdmin.questionTemplates.findById(
        questionTemplateId
      );
      await targetQuestionTemplate.delete();

      const updatedQuestionTemplates = await targetAdmin.questionTemplates;
      return updatedQuestionTemplates;
    },
    async deleteChallenge(_, { challengeId }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new Error(error);
      }
      const targetChallenge = await targetAdmin.Challenges.findById(
        challengeId
      );
      await targetChallenge.delete();

      const updatedChallenges = await targetAdmin.challenges;
      return updatedChallenges;
    },
  },
};
