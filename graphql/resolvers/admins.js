const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError, AuthenticationError } = require("apollo-server");

const {
  validateUserRegisterInput,
  validateUserLoginInput,
} = require("../../util/validators");
const SECRET_KEY = process.env.SECRET_ADMIN_KEY;
const Admin = require("../../models/Admin");
const Question = require("../../models/Question");
const QuestionTemplate = require("../../models/QuestionTemplate");
const Module = require("../../models/Module");

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
        throw AuthenticationError;
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
      { image, questionDescription, expectedAnswers, hint, questionTemplateId },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw AuthenticationError;
      }

      targetQuestion = Question.findOne({
        questionDescription: questionDescription,
      });

      if (targetQuestion === null) {
        const newQuestion = new Question({
          image,
          questionDescription,
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
      } else {
        const unchangedQuestions = await targetAdmin.modules.questions;
        return unchangedQuestions;
      }
    },

    async createNewQuestionTemplate(
      _,
      { categoryId, type, inputFields },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw AuthenticationError;
      }

      targetQuestionTemplate = QuestionTemplate.findOne({
        inputFields: inputFields,
      });

      if (targetQuestionTemplate === null) {
        const newQuestionTemplate = new QuestionTemplate({
          categoryId,
          type,
          inputFields,
          createdAt: new Date(),
        });
        targetAdmin.questionTemplates.push(newQuestionTemplate.id);
        await targetAdmin.questionTemplates.save();

        const updatedQuestionTemplates = await targetAdmin.questionTemplates;
        return updatedQuestionTemplates;
      } else {
        const unchangedQuestionTemplates = await targetAdmin.questionTemplates;
        return unchangedQuestionTemplates;
      }
    },

    async createNewModule(_, { name, type, categoryId, format }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw AuthenticationError;
      }

      targetModule = Module.findOne({
        name: name,
      });

      if (targetModule !== null) {
        const newModule = new Module({
          name,
          type,
          categoryId,
          format,
          createdAt: new Date(),
        });

        targetAdmin.modules.push(newModule);
        await targetAdmin.modules.save();
        const updatedModules = await targetAdmin.modules;
        return updatedModules;
      } else {
        const unchangedModules = await targetAdmin.modules;
        return unchangedModules;
      }
    },

    async createNewChallenge(
      _,
      { questionDescription, categoryId, image },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw AuthenticationError;
      }
      const newChallenge = new Challenge({
        questionDescription,
        categoryId,
        image,
        createdAt: new Date(),
      });

      targetAdmin.challenges.push(newChallenge);
      await targetAdmin.challenges.save();
      const updatedChallenges = await targetAdmin.challenges;
      return updatedChallenges;
    },

    async editModule(
      _,
      { moduleId, newName, newType, newCategoryId, newFormat },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw AuthenticationError;
      }
      var targetModule = await targetAdmin.modules.findById(moduleId);

      targetModule.name = newName;
      targetModule.categoryId = newCategoryId;
      targetModule.format = newFormat;
      targetModule.type = newType;

      await targetModule.save();
      return targetModule;
    },

    async editQuestion(
      _,
      {
        questionId,
        newImage,
        newquestionDescription,
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
        throw AuthenticationError;
      }
      var targetQuestion = await targetAdmin.modules.questions.findById(
        questionId
      );

      targetQuestion.image = newImage;
      targetQuestion.questionDescription = newquestionDescription;
      targetQuestion.expectedAnswers = newExpectedAnswers;
      targetQuestion.hint = newHint;
      targetQuestion.questionTemplateId = newQuestionTemplateId;

      await targetQuestion.save();
      return targetQuestion;
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
        throw AuthenticationError;
      }
      var targetQuestionTemplate = await targetAdmin.modules.questions.findById(
        questionTemplateId
      );

      targetQuestionTemplate.categoryId = newCategory;
      targetQuestionTemplate.inputFields = newInputFields;
      targetQuestionTemplate.type = newType;
      await targetQuestionTemplate.save();

      return targetQuestionTemplate;
    },

    async editChallenge(
      _,
      { challengeId, newquestionDescription, newImage },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw AuthenticationError;
      }
      var targetChallenge = await targetAdmin.challenges.findById(challengeId);

      targetChallenge.categoryId = newCategoryId;
      targetChallenge.questionDescription = newquestionDescription;
      targetChallenge.image = newImage;

      await targetChallenge.save();
      return targetChallenge;
    },

    async deleteModule(_, { moduleId }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw AuthenticationError;
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
        throw AuthenticationError;
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
        throw AuthenticationError;
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
        throw AuthenticationError;
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
