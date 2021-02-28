const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError, AuthenticationError } = require("apollo-server");

const {
  validateUserRegisterInput,
  validateUserLoginInput,
  validateUserEditInput,
} = require("../../util/validators");
const SECRET_KEY = process.env.SECRET_MENTOR_KEY;
const Mentor = require("../../models/Mentor");

const checkMentorAuth = require("../../util/checkMentorAuth");
const checkAdminAuth = require("../../util/checkAdminAuth");
const Student = require("../../models/Student");

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
      try {
        const mentor = checkMentorAuth(context);
        const targetMentor = await Mentor.findById(mentor.id);
        return targetMentor;
      } catch (error) {
        throw new UserInputError("Invalid input");
      }
    },
    async getMentors(_, {}, context) {
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
      const mentors = await Mentor.find();
      if (!mentors) {
        throw new UserInputError("Invalid input");
      } else {
        return mentors;
      }
    },
    async getMentorById(_, { mentorId }, context) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        try {
          const mentor = checkMentorAuth(context);
        } catch (error) {
          const student = checkAdminAuth(context);
          if (!student) {
            throw new AuthenticationError();
          }
        }
      }
      const targetMentor = await Mentor.findById(mentorId);
      if (!targetMentor) {
        throw new UserInputError("Invalid input");
      } else {
        return targetMentor;
      }
    },

    async getStudentsByMentor(_, { mentorId }, context) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        try {
          const mentor = checkMentorAuth(context);
        } catch (error) {
          throw new AuthenticationError(error);
        }
      }

      var allStudents = await Student.find();
      var students = [];
      var student;
      for (var targetStudent of allStudents) {
        if (targetStudent.mentors.includes(mentorId)) {
          // console.log(targetStudent.id);
          student = await Student.findById(targetStudent.id);
          students.push(student);
          // console.log(stud);
        }
      }
      return students;
    },
  },

  Mutation: {
    async signupMentor(
      _,
      { email, orgName, name, password, confirmPassword },
      context
    ) {
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
        name,
        password,
        orgName,
        createdAt: new Date(),
      });

      const res = await newMentor.save();

      const token = generateToken(res);

      return { ...res._doc, id: res._id, token };
    },

    async editMentor(
      _,
      {
        mentorId,
        newName,
        newEmail,
        newOrgName,
        newPassword,
        confirmNewPassword,
      },
      context
    ) {
      try {
        var user = checkAdminAuth(context);
      } catch (error) {
        try {
          var user = checkMentorAuth(context);
        } catch (error) {
          throw new AuthenticationError(error);
        }
      }

      const targetMentor = await Mentor.findById(mentorId);
      if (!targetMentor) {
        throw new UserInputError("Mentor does not exist", {
          errors: {
            email: "Mentor does not exist",
          },
        });
      }

      var { valid, errors } = validateUserEditInput(
        newEmail,
        newPassword,
        confirmNewPassword
      );

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      newPassword = await bcrypt.hash(newPassword, 12);
      if (newName !== undefined && newName !== "") {
        targetMentor.name = newName;
      }
      if (newOrgName !== undefined && newOrgName !== "") {
        // console.log(targetMentor.orgName);
        targetMentor.orgName = newOrgName;
      }
      if (newEmail !== undefined && newEmail !== "") {
        targetMentor.email = newEmail;
      }
      if (newPassword !== undefined && newPassword !== "") {
        targetMentor.password = newPassword;
      }

      const res = await targetMentor.save();

      const token = generateToken(res);

      return { ...res._doc, id: res._id, token };
    },

    async loginMentor(_, { email, password }, context) {
      const { errors, valid } = validateUserLoginInput(email, password);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const mentor = await Mentor.findOne({ email });

      if (!mentor) {
        errors.email = "Mentor not found";
        throw new UserInputError("Mentor not found", {
          errors,
        });
      }

      const match = await bcrypt.compare(password, mentor.password);

      if (!match) {
        errors.password = "Wrong credentials";
        throw new UserInputError("Wrong credentials", {
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
          throw new AuthenticationError(error);
        }
      }
      const targetMentor = await Mentor.findById(mentorId);
      if (targetMentor) {
        await targetMentor.delete();
        return "Delete Successful";
      } else {
        throw new UserInputError("Invalid input");
      }
    },
  },
};
