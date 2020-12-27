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
const checkAdminAuth = require("../../util/checkAdminAuth");

function generateToken(mentor) {
  return jwt.sign(
    {
      id: mentor.id,
      email: mentor.email,
    },
    SECRET_KEY
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
    async getStudentsByMentor(_, {}, context) {
      try {
        const mentor = checkMentorAuth(context);
        const targetMentor = await Mentor.findById(mentor.id);
        const students = await targetMentor.students;
        return students;
      } catch (error) {
        console.log(error);
        return [];
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
        throw new UserInputError("Invalid input")("Errors", { errors });
      }

      const checkMentor = await Mentor.findOne({ email });
      if (checkMentor) {
        throw new UserInputError("Invalid input")("Email already exists", {
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
        throw new UserInputError("Invalid input")("Errors", { errors });
      }

      const mentor = await Mentor.findOne({ email });

      if (!mentor) {
        errors.email = "Mentor not found";
        throw new UserInputError("Invalid input")("Mentor not found", {
          errors,
        });
      }

      const match = await bcrypt.compare(password, mentor.password);

      if (!match) {
        errors.password = "Wrong credentials";
        throw new UserInputError("Invalid input")("Wrong credentials", {
          errors,
        });
      }

      const token = generateToken(mentor);
      return { ...mentor._doc, id: mentor._id, token };
    },
    async deleteMentor(_, { mentorId }, context) {
      try {
        var user = checkAdminAuth(context);
      } catch (error) {
        try {
          var user = checkMentorAuth(context);
        } catch (error) {
          throw new Error(error);
        }
      }
      const targetMentor = Mentor.findById(mentorId);
      if (targetMentor !== null) {
        await targetMentor.delete();
        return "Delete Successful";
      } else {
        throw UserInputError("Invalid input");
      }
    },
  },
};
