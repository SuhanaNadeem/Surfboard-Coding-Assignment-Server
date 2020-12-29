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
const Challenge = require("../../models/Challenge");
const Category = require("../../models/Category");

const checkAdminAuth = require("../../util/checkAdminAuth");
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

      const modules = [];
      const questionTemplates = [];
      const challenges = [];
      const categories = [];

      const newAdmin = new Admin({
        name,
        email,
        password,
        modules,
        questionTemplates,
        challenges,
        categories,
        createdAt: new Date(),
      });

      const res = await newAdmin.save();

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
          throw new Error(error);
        }
      }
      const targetAdmin = Admin.findById(adminId);
      if (targetAdmin !== null) {
        await targetAdmin.delete();
        return "Delete Successful";
      } else {
        throw new UserInputError("Invalid input");
      }
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
        throw new AuthenticationError();
      }

      const targetQuestion = Question.findOne({
        questionDescription,
      });

      if (targetQuestion == null) {
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
        await targetAdmin.save();

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
        throw new AuthenticationError();
      }

      const targetQuestionTemplate = QuestionTemplate.findOne({
        inputFields,
      });

      if (targetQuestionTemplate == null) {
        const newQuestionTemplate = new QuestionTemplate({
          categoryId,
          type,
          inputFields,
          createdAt: new Date(),
        });
        targetAdmin.questionTemplates.push(newQuestionTemplate.id);
        await targetAdmin.questionTemplates.save();
        await targetAdmin.save();

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
        throw new AuthenticationError();
      }

      const targetModule = Module.findOne({
        name,
      });

      if (targetModule == null) {
        const newModule = new Module({
          name,
          type,
          categoryId,
          format,
          createdAt: new Date(),
        });

        await targetAdmin.modules.push(newModule.id);
        await targetAdmin.modules.save();
        await targetAdmin.save();

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
        throw new AuthenticationError();
      }
      const targetChallenge = Challenge.findOne({ questionDescription });
      if (targetChallenge == null) {
        const newChallenge = new Challenge({
          questionDescription,
          categoryId,
          image,
          createdAt: new Date(),
        });

        await targetAdmin.challenges.push(newChallenge.id);
        await targetAdmin.challenges.save();
        await targetAdmin.save();
        const updatedChallenges = await targetAdmin.challenges;
        return updatedChallenges;
      } else {
        const unchangedChallenges = await targetAdmin.challenges;
        return unchangedChallenges;
      }
    },

    async createNewCategory(_, { name }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        console.log(error);
        throw new AuthenticationError();
      }

      const targetCategory = await Category.findOne({ name });
      if (targetCategory) {
        console.log(targetCategory);

        return targetCategory;
      } else {
        const newCategory = new Category({
          name,
          createdAt: new Date(),
        });
        await newCategory.save();
        targetAdmin.categories.push(newCategory.id);
        await targetAdmin.save();
        return newCategory;
      }
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
        throw new AuthenticationError();
      }
      var targetModule = await targetAdmin.modules.findById(moduleId);
      if (targetModule == null) {
        throw new UserInputError("Invalid input");
      } else {
        targetModule.name = newName;
        targetModule.categoryId = newCategoryId;
        targetModule.format = newFormat;
        targetModule.type = newType;

        await targetModule.save();
        return targetModule;
      }
    },

    async editQuestion(
      _,
      {
        questionId,
        newImage,
        newQuestionDescription,
        newExpectedAnswers,
        newHint,
      },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      var targetQuestion = await Question.findById(questionId);
      if (targetQuestion == null) {
        throw new UserInputError("Invalid input");
      } else {
        targetQuestion.image = newImage;
        targetQuestion.questionDescription = newQuestionDescription;
        targetQuestion.expectedAnswers = newExpectedAnswers;
        targetQuestion.hint = newHint;

        await targetQuestion.save();
        return targetQuestion;
      }
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
        throw new AuthenticationError();
      }
      var targetQuestionTemplate = await QuestionTemplate.findById(
        questionTemplateId
      );
      if (targetQuestionTemplate == null) {
        throw new UserInputError("Invalid input");
      } else {
        targetQuestionTemplate.categoryId = newCategory;
        targetQuestionTemplate.inputFields = newInputFields;
        targetQuestionTemplate.type = newType;
        await targetQuestionTemplate.save();
        return targetQuestionTemplate;
      }
    },

    async editChallenge(
      _,
      { challengeId, newQuestionDescription, newImage },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      var targetChallenge = await Challenge.findById(challengeId);
      if (targetChallenge == null) {
        throw new UserInputError("Invalid input");
      } else {
        targetChallenge.categoryId = newCategoryId;
        targetChallenge.questionDescription = newQuestionDescription;
        targetChallenge.image = newImage;
        await targetChallenge.save();
        return targetChallenge;
      }
    },
    async editCategory(_, { categoryId, newName }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      var targetCategory = await Category.findById(categoryId);
      if (targetCategory == null) {
        throw new UserInputError("Invalid input");
      } else {
        targetCategory.name = newName;

        await targetCategory.save();
        return targetCategory;
      }
    },
    async deleteModule(_, { moduleId }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      const targetModule = await Module.findById(moduleId);
      if (targetModule == null) {
        throw new UserInputError("Invalid input");
      } else {
        await targetModule.delete();

        const updatedModules = targetAdmin.modules;
        return updatedModules;
      }
    },

    async deleteQuestion(_, { questionId }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      const targetQuestion = await targetAdmin.modules.questions.findById(
        questionId
      );
      if (targetQuestion == null) {
        throw new UserInputError("Invalid input");
      } else {
        await targetQuestion.delete();
        await targetAdmin.save();
        const updatedQuestions = await targetAdmin.modules.questions;
        return updatedQuestions;
      }
    },

    async deleteQuestionTemplate(_, { questionTemplateId }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      const targetQuestionTemplate = await targetAdmin.questionTemplates.findById(
        questionTemplateId
      );
      if (targetQuestionTemplate == null) {
        throw new UserInputError("Invalid input");
      } else {
        await targetQuestionTemplate.delete();

        const updatedQuestionTemplates = await targetAdmin.questionTemplates;
        return updatedQuestionTemplates;
      }
    },
    async deleteChallenge(_, { challengeId }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new AuthenticationError();
      }
      const targetChallenge = await targetAdmin.challenges.findById(
        challengeId
      );
      if (targetChallenge == null) {
        throw new UserInputError("Invalid input");
      } else {
        await targetChallenge.delete();
        const updatedChallenges = await targetAdmin.challenges;
        return updatedChallenges;
      }
    },
    async deleteCategory(_, { categoryId }, context) {
      try {
        const admin = checkAdminAuth(context);
        var targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        console.log(error);
        throw new AuthenticationError();
      }
      const targetCategory = await Category.findById(categoryId);
      if (!targetCategory) {
        throw new UserInputError("Invalid input");
      } else {
        const index = targetAdmin.categories.indexOf(categoryId);
        targetAdmin.categories.splice(index, 1);
        await targetAdmin.save();
        await targetCategory.delete(); // TODO delete AFTER
        //TODO Splice from admin  getcategories query and new = save
        const updatedCategories = targetAdmin.categories;
        return updatedCategories;
      }
    },
  },
};
