const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError, AuthenticationError } = require("apollo-server");

const {
  validateUserRegisterInput,
  validateUserLoginInput,
} = require("../../util/validators");
const SECRET_KEY = process.env.SECRET_STUDENT_KEY;
const Student = require("../../models/Student");
const checkStudentAuth = require("../../util/checkStudentAuth");
function generateToken(student) {
  return jwt.sign(
    {
      id: student.id,
      email: student.email,
    },
    SECRET_KEY
    //{ expiresIn: "3h" }
  );
}

module.exports = {
  Query: {
    async getStudent(_, {}, context) {
      try {
        const student = checkStudentAuth(context);
        const targetStudent = await Student.findById(student.id);
        return targetStudent;
      } catch (error) {
        throw new Error(error);
      }
    },
    async getCompletedModulesByStudent(_, {}, context) {
      try {
        const student = checkStudentAuth(context);
        const targetStudent = await Student.findById(student.id);
        const completedModules = await User.find({
          id: targetStudent.completedModules,
        });
        return completedModules;
      } catch (error) {
        console.log(error);
        return [];
      }
    },

    async getInProgressModulesByStudent(_, {}, context) {
      try {
        const student = checkStudentAuth(context);
        const targetStudent = await Student.findById(student.id);
        const inProgressModules = await Student.find({
          id: targetStudent.inProgressModules,
        });
        return inProgressModules;
      } catch (error) {
        console.log(error);
        return [];
      }
    },

    async getBadgesByStudent(_, {}, context) {
      try {
        const student = checkStudentAuth(context);
        const targetStudent = await Student.findById(student.id);
        const badges = await Student.find({
          id: targetStudent.badges,
        });
        return badges;
      } catch (error) {
        console.log(error);
        return [];
      }
    },

    async getMentorsByStudent(_, {}, context) {
      try {
        const student = checkStudentAuth(context);
        const targetStudent = await Student.findById(student.id);
        const mentors = await Student.find({
          id: targetStudent.mentors,
        });
        return mentors;
      } catch (error) {
        console.log(error);
        return [];
      }
    },
  },

  Mutation: {
    async signupStudent(_, { email, password, confirmPassword }, context) {
      var { valid, errors } = validateUserRegisterInput(
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const checkStudent = await Student.findOne({ email });
      if (checkStudent) {
        throw new UserInputError("Email already exists", {
          errors: {
            email: "An student with this email already exists",
          },
        });
      }

      password = await bcrypt.hash(password, 12);

      const newStudent = new Student({
        email,
        password,
        createdAt: new Date(),
      });

      const res = await newStudent.save();

      const token = generateToken(res);

      return { ...res._doc, id: res._id, token };
    },

    async loginStudent(_, { email, password }, context) {
      const { errors, valid } = validateUserLoginInput(email, password);
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const student = await Student.findOne({ email });

      if (!student) {
        errors.email = "Student not found";
        throw new UserInputError("Student not found", { errors });
      }

      const match = await bcrypt.compare(password, student.password);

      if (!match) {
        errors.password = "Wrong credentials";
        throw new UserInputError("Wrong credentials", { errors });
      }

      const token = generateToken(student);
      return { ...student._doc, id: student._id, token };
    },

    async addCompletedModule(_, { moduleId }, context) {
      // add to students module list
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        console.log(error);
        return [];
      }
      targetModule = Student.findOne(moduleId); // TODO think i have to do .modules here

      if (!targetStudent.completedModules.includes(targetModule.id)) {
        targetStudent.completedModules.push(targetModule.id);
      }
      const updatedCompletedModules = await targetStudent.completedModules;
      return updatedCompletedModules;
    },

    async addInProgressModule(_, { moduleId }, context) {
      // add to students module list
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        console.log(error);
        return [];
      }
      targetModule = Student.findOne(moduleId);

      if (!targetStudent.inProgressModules.includes(targetModule.id)) {
        targetStudent.inProgressModules.push(targetModule.id);
      }
      const updatedInProgressModules = await targetStudent.inProgressModules;
      return updatedInProgressModules;
    },

    async addBadge(_, { badgeId }, context) {
      // add to students module list
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        console.log(error);
        return [];
      }
      targetBadge = Student.findOne(badgeId);
      if (!targetStudent.badges.includes(targetBadge.id)) {
        targetStudent.badges.push(targetBadge.id);
      }
      const updatedBadges = await targetStudent.badges;
      return updatedBadges;
    },

    async submitAnswer(
      _,
      { answerId, studentId, categoryId, questionId, moduleId },
      context
    ) {
      // add to students module list
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        console.log(error);
        return None;
      }
      const targetAnswer = Student.findById(answerId);
      // instead of the above, why cant i just do answerId below?

      if (!targetStudent.submittedAnswers.includes(targetAnswer.id)) {
        const newAnswer = new Answer({
          answerId,
          studentId,
          categoryId,
          questionId,
          moduleId,
          createdAt: new Date(),
        });
        targetStudent.submittedAnswers.push(newAnswer.id);
        return newAnswer;
      }
    }, // TODO check the other comment here

    async starModule(_, { moduleId }, context) {
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        console.log(error);
        return None;
      }
      targetModule = Student.findOne(moduleId);
      if (!targetStudent.starredModules.includes(targetModule.id)) {
        targetStudent.starredModules.push(targetModule.id);
      }
      const updatedStarredModules = await targetStudent.starredModules;
      return updatedStarredModules;
    },

    async unstarModule(_, { moduleId }, context) {
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        console.log(error);
        return None;
      }
      targetModule = Student.findOne(moduleId);
      if (targetStudent.starredModules.includes(targetModule.id)) {
        const index = targetStudent.starredModules.indexOf(moduleId);
        targetStudent.starredModules.splice(index, 1);
      }
      const updatedStarredModules = await targetStudent.starredModules;
      return updatedStarredModules;
    },

    async starQuestion(_, { questionId }, context) {
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        console.log(error);
        return None;
      }
      targetQuestion = Student.findOne(questionId);
      if (!targetStudent.starredQuestions.includes(targetQuestion.id)) {
        targetStudent.starredQuestions.push(targetQuestion.id);
      }
      const updatedStarredQuestions = await targetStudent.starredQuestions;
      return updatedStarredQuestions;
    },
    async unstarQuestion(_, { questionId }, context) {
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        console.log(error);
        return None;
      }
      targetQuestion = Student.findOne(questionId);
      if (targetStudent.starredQuestions.includes(targetQuestion.id)) {
        const index = targetStudent.starredQuestions.indexOf(questionId);
        targetStudent.starredQuestions.splice(index, 1);
      }
      const updatedStarredQuestions = await targetStudent.starredQuestions;
      return updatedStarredQuestions;
    },
  },
};
