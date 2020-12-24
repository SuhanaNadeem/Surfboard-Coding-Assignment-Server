const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError, AuthenticationError } = require("apollo-server");

const {
  validateUserRegisterInput,
  validateUserLoginInput,
} = require("../../util/validators");
const SECRET_KEY = process.env.SECRET_MENTOR_KEY;
const Mentor = require("../../models/Mentor");
const checkMentorAuth = require("../../util/checkMentorAuth");
function generateToken(mentor) {
  return jwt.sign(
    {
      id: mentor.id,
      email: mentor.email,
    },
    SECRET_KEY
    //{ expiresIn: "3h" }
  );
}

module.exports = {
  Query: {
    async getMentor(_, {}, context) {
      const mentor = checkMentorAuth(context);

      try {
        const targetMentor = await Mentor.findById(mentor.id);

        return targetMentor;
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  Mutation: {
    async signupMentor(_, { email, password, confirmPassword }, context) {
      var { valid, errors } = validateUserRegisterInput(
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const checkMentor = await Mentor.findOne({ email });
      if (checkMentor) {
        throw new UserInputError("Email already exists", {
          errors: {
            email: "An mentor with this email already exists",
          },
        });
      }

      password = await bcrypt.hash(password, 12);

      const newMentor = new Mentor({
        email,
        password,
        createdAt: new Date(),
      });

      const res = await newMentor.save();

      const token = generateToken(res);

      return { ...res._doc, id: res._id, token };
    },

    async loginMentor(_, {}, context) {
      const { errors, valid } = validateUserLoginInput(email, password);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const mentor = await Mentor.findOne({ email });

      if (!mentor) {
        errors.email = "Mentor not found";
        throw new UserInputError("Mentor not found", { errors });
      }

      const match = await bcrypt.compare(password, mentor.password);

      if (!match) {
        errors.password = "Wrong credentials";
        throw new UserInputError("Wrong credentials", { errors });
      }

      const token = generateToken(mentor);
      return { ...mentor._doc, id: mentor._id, token };
    },
  },
};
