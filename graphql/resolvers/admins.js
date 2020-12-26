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
      { image, infoProvided, expectedAnswers, hint },
      context
    ) {
      try {
        const admin = checkAdminAuth(context);
        const targetAdmin = await Admin.findById(admin.id);
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
          createdAt: new Date(),
        });
        targetAdmin.modules.questions.push(newQuestion.id);
        return newQuestion;
      }

      // make the question and add to the modules list

      // const res = await newModule.save();

      // TODO whats the point of the following line
      // return { ...res._doc, id: res._id };
    },

    async createNewModule(_, { type, categoryId, format }, context) {
      try {
        const admin = checkAdminAuth(context);
        const targetAdmin = await Admin.findById(admin.id);
      } catch (error) {
        throw new Error(error);
      }
      const newModule = new Module({
        type,
        categoryId,
        format,
        createdAt: new Date(),
      });
      return newModule;

      // const res = await newModule.save();

      // TODO whats the point of the following line
      // return { ...res._doc, id: res._id };
    },
  },
};
