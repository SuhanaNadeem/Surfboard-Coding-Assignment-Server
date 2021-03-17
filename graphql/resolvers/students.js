const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError, AuthenticationError } = require("apollo-server");

const {
  validateUserRegisterInput,
  validateUserLoginInput,
  validateUserEditInput,
} = require("../../util/validators");
const SECRET_KEY = process.env.SECRET_STUDENT_KEY;
const Student = require("../../models/Student");
const Badge = require("../../models/Badge");
const Question = require("../../models/Question");
const Mentor = require("../../models/Mentor");
const Answer = require("../../models/Answer");

const checkStudentAuth = require("../../util/checkStudentAuth");
const checkAdminAuth = require("../../util/checkAdminAuth");
const checkMentorAuth = require("../../util/checkMentorAuth");
const answerResolvers = require("./answers");
const moduleResolvers = require("./modules");
const badgeResolvers = require("./badges");

const questionResolvers = require("./questions");
const StringIntDict = require("../../models/StringIntDict");
const StringStringDict = require("../../models/StringStringDict");
const Module = require("../../models/Module");

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
        throw new UserInputError("Invalid input");
      }
    },

    async getStudentById(_, { studentId }, context) {
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
        return targetStudent;
      }
    },
    async getStudents(_, {}, context) {
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
      const students = await Student.find();
      if (!students) {
        throw new UserInputError("Invalid input");
      } else {
        return students;
      }
    },

    async getMentorsByStudent(_, { studentId }, context) {
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
      if (targetStudent) {
        const mentorIds = targetStudent.mentors;
        const mentors = await Mentor.find({
          _id: { $in: mentorIds },
        });
        return mentors;
      } else {
        throw new UserInputError("Invalid input");
      }
    },
    async getTotalPointsByStudent(_, { studentId }, context) {
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
      }
      var totalPoints = 0;
      var pointsFromCompleted = 0;
      var pointsFromInProgress = 0;
      var completedModulePoints;
      var inProgressModulePoints;
      var targetModule;
      // console.log(targetStudent.completedModules);
      for (var completedModuleId of targetStudent.completedModules) {
        // console.log(20);
        targetModule = await Module.findById(completedModuleId);
        if (targetModule) {
          // console.log(targetModule)
          completedModulePoints = await moduleResolvers.Query.getTotalPossibleModulePoints(
            _,
            { moduleId: completedModuleId },
            context
          );
          // console.log(21);
          pointsFromCompleted += completedModulePoints;
        }
      }

      for (var inProgressModuleId of targetStudent.inProgressModules) {
        targetModule = await Module.findById(inProgressModuleId);
        if (targetModule) {
          // console.log(targetModule)

          inProgressModulePoints = await moduleResolvers.Query.getModulePointsByStudent(
            _,
            { moduleId: inProgressModuleId, studentId },
            context
          );
          pointsFromInProgress += inProgressModulePoints;
        }
      }
      totalPoints = pointsFromCompleted + pointsFromInProgress;
      return totalPoints;
    },
  },

  Mutation: {
    async signupStudent(
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
        name,
        orgName,
        password,
        inProgressModules: [],
        completedModules: [],
        badges: [],
        starredModules: [],
        starredQuestions: [],
        completedQuestions: [],
        completedSkills: [],
        mentors: [],
        quesAnsDict: [],
        modulePointsDict: [],
        icon: "https://li-images.s3.amazonaws.com/3908900704/icon1.png",
        createdAt: new Date(),
      });

      const res = await newStudent.save();

      const token = generateToken(res);

      return { ...res._doc, id: res._id, token };
    },

    async editStudent(
      _,
      {
        studentId,
        newName,
        newOrgName,
        newEmail,
        newPassword,
        confirmNewPassword,
      },
      context
    ) {
      try {
        var user = checkAdminAuth(context);
      } catch (error) {
        try {
          var user = checkStudentAuth(context);
        } catch (error) {
          throw new AuthenticationError(error);
        }
      }
      // var initialErrors = {};
      const targetStudent = await Student.findById(studentId);

      var { valid, errors } = validateUserEditInput(
        newEmail,
        newPassword,
        confirmNewPassword
      );
      if (!targetStudent) {
        errors.studentId = "Student does not exist";
      }
      if (newName === "" || !newName) {
        errors.newName = "Student name must be provided";
      }
      if (newOrgName === "" || !newOrgName) {
        errors.newOrgName = "Student organization must be provided";
      }
      if (!valid || Object.keys(errors).length >= 1) {
        throw new UserInputError("Errors", { errors });
      }

      newPassword = await bcrypt.hash(newPassword, 12);
      if (newName !== undefined && newName !== "") {
        targetStudent.name = newName;
      }
      if (newOrgName !== undefined && newOrgName !== "") {
        targetStudent.orgName = newOrgName;
      }
      if (newEmail !== undefined && newEmail !== "") {
        targetStudent.email = newEmail;
      }
      if (newPassword !== undefined && newPassword !== "") {
        targetStudent.password = newPassword;
      }

      const res = await targetStudent.save();

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
        throw new UserInputError("Student not found", {
          errors,
        });
      }

      const match = await bcrypt.compare(password, student.password);

      if (!match) {
        errors.password = "Wrong credentials";
        throw new UserInputError("Wrong credentials", {
          errors,
        });
      }

      const token = generateToken(student);
      return { ...student._doc, id: student._id, token };
    },

    async deleteStudent(_, { studentId }, context) {
      try {
        var user = checkAdminAuth(context);
      } catch (error) {
        try {
          var user = checkMentorAuth(context);
        } catch (error) {
          throw new Error(error);
        }
      }

      const targetStudent = await Student.findById(studentId);
      if (targetStudent) {
        await targetStudent.delete();
        return "Delete Successful";
      } else {
        throw new UserInputError("Invalid input");
      }
    },

    async starQuestion(_, { questionId }, context) {
      try {
        var user = checkStudentAuth(context);
        var targetUser = await Student.findById(user.id);
      } catch (error) {
        try {
          var user = checkMentorAuth(context);
          var targetUser = await Mentor.findById(user.id);
        } catch (error) {
          throw new Error(error);
        }
      }
      const targetQuestion = await Question.findById(questionId);
      if (!targetQuestion || targetUser.starredQuestions.includes(questionId)) {
        throw new UserInputError("Invalid input");
      } else {
        await targetUser.starredQuestions.push(questionId);
        await targetUser.save();
        const updatedStarredQuestions = targetUser.starredQuestions;
        return updatedStarredQuestions;
      }
    },
    async unstarQuestion(_, { questionId }, context) {
      try {
        var user = checkStudentAuth(context);
        var targetUser = await Student.findById(user.id);
      } catch (error) {
        try {
          var user = checkMentorAuth(context);
          var targetUser = await Mentor.findById(user.id);
        } catch (error) {
          throw new Error(error);
        }
      }
      const targetQuestion = await Question.findById(questionId);
      if (
        !targetQuestion ||
        !targetUser.starredQuestions.includes(questionId)
      ) {
        throw new UserInputError("Invalid input");
      } else {
        const index = targetUser.starredQuestions.indexOf(questionId);
        targetUser.starredQuestions.splice(index, 1);
        await targetUser.save();
        const updatedStarredQuestions = targetUser.starredQuestions;
        return updatedStarredQuestions;
      }
    },
    async handleStarQuestion(_, { questionId }, context) {
      try {
        var user = checkStudentAuth(context);
        var targetUser = await Student.findById(user.id);
      } catch (error) {
        try {
          var user = checkMentorAuth(context);
          var targetUser = await Mentor.findById(user.id);
        } catch (error) {
          throw new Error(error);
        }
      }

      var updatedStarredQuestions;
      if (!targetUser.starredQuestions.includes(questionId)) {
        updatedStarredQuestions = await module.exports.Mutation.starQuestion(
          _,
          { questionId },
          context
        );
      } else {
        updatedStarredQuestions = await module.exports.Mutation.unstarQuestion(
          _,
          { questionId },
          context
        );
      }
      return updatedStarredQuestions;
    },

    async handleAnswerPoints(_, { answer, studentId, questionId }, context) {
      // console.log("arriving here");

      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        try {
          const mentor = checkMentorAuth(context);
        } catch (error) {
          const student = checkStudentAuth(context);
        }
      }
      const badges = await Badge.find();
      const targetQuestion = await Question.findById(questionId);
      const moduleId = targetQuestion.moduleId;
      const numToIncrement = targetQuestion.points;
      const targetModulePointsPair = await StringIntDict.findOne({
        studentId,
        key: moduleId,
      });
      var targetQuesAnsPair = await StringStringDict.find({
        studentId,
        key: questionId,
      });
      // console.log(1);
      const totalPossiblePoints = await moduleResolvers.Query.getTotalPossibleModulePoints(
        _,
        { moduleId },
        context
      );
      var targetStudent = await Student.findById(studentId);
      var answerCorrect;
      // console.log(2);
      if (!targetQuesAnsPair || targetQuesAnsPair.length == 0) {
        targetQuesAnsPair = await questionResolvers.Mutation.startQuestion(
          _,
          { questionId, studentId },
          context
        );
      }
      // console.log(3);
      if (
        !targetQuestion ||
        (targetQuestion.type !== "Skill" &&
          targetQuestion.type !== "Question") ||
        !targetStudent
      ) {
        // console.log(3.5);
        throw new UserInputError("Invalid input");
      } else if (targetQuestion.type === "Skill") {
        // console.log(4);

        if (!targetStudent.completedSkills.includes(questionId)) {
          // console.log(5);
          answerCorrect = true;
          const updatedPoints = await moduleResolvers.Mutation.incrementModulePoints(
            _,
            { moduleId, answerCorrect, numToIncrement, studentId },
            context
          );
          // console.log(6);
          targetStudent.completedSkills.push(questionId);
          await targetStudent.save();
          if (totalPossiblePoints === updatedPoints) {
            await moduleResolvers.Mutation.addCompletedModule(
              _,
              { moduleId, studentId },
              context
            );
          }
          // console.log(7);
          for (var targetBadge of badges) {
            await badgeResolvers.Mutation.handleAddBadge(
              _,
              { badgeId: targetBadge.id, studentId },
              context
            );
          }
          // console.log(8);
          await module.exports.Mutation.changeStudentIcon(
            _,
            { studentId },
            context
          );
          // console.log(9);
          return answerCorrect;
        } else {
          // console.log(10);
          // console.log(targetModulePointsPair.value)
          return true;
        }
      } else {
        // console.log(5);
        if (
          targetQuestion.expectedAnswer === "" ||
          !targetQuestion.expectedAnswer
        ) {
          // console.log(6);
          await answerResolvers.Mutation.saveAnswer(
            _,
            { answer, studentId, questionId },
            context
          );
          // console.log(7);
          answerCorrect = true;

          const updatedPoints = await moduleResolvers.Mutation.incrementModulePoints(
            _,
            { moduleId, answerCorrect, numToIncrement, studentId },
            context
          );
          // push to completedquestions
          // targetStudent.completedQuestions.push(questionId);
          // await targetStudent.save();
          await module.exports.Mutation.addCompletedQuestion(
            _,
            { questionId, studentId },
            context
          );
          // console.log("in backend");
          // console.log(questionId);
          // console.log(targetStudent.completedQuestions);
          if (totalPossiblePoints === updatedPoints) {
            await moduleResolvers.Mutation.addCompletedModule(
              _,
              { moduleId, studentId },
              context
            );
          }
          for (var targetBadge of badges) {
            await badgeResolvers.Mutation.handleAddBadge(
              _,
              { badgeId: targetBadge.id, studentId },
              context
            );
          }

          await module.exports.Mutation.changeStudentIcon(
            _,
            { studentId },
            context
          );
          return answerCorrect;
        } else {
          // console.log(8);
          // const answerObject = await Answer.find({
          //   studentId,
          //   answer,
          //   questionId,
          // });

          // if (
          //   answerObject &&
          //   answerObject[0] &&
          //   targetQuestion.expectedAnswer === answerObject[0].answer
          // ) {
          //   return targetModulePointsPair[0].value;
          // }
          if (targetStudent.completedQuestions.includes(questionId)) {
            return targetModulePointsPair.value;
          } else {
            // console.log(9);
            const savedAnswer = await answerResolvers.Mutation.saveAnswer(
              _,
              { answer, studentId, questionId },
              context
            );
            const answerId = savedAnswer.id;
            // console.log(10);
            answerCorrect = await module.exports.Mutation.verifyAnswer(
              _,
              { answerId, questionId, studentId },
              context
            );
            // console.log(11);
            // (if answerCorrect, push to completedQuestions)
            const updatedPoints = await moduleResolvers.Mutation.incrementModulePoints(
              _,
              { moduleId, answerCorrect, numToIncrement, studentId },
              context
            );
            // console.log(12);
            if (answerCorrect) {
              // targetStudent.completedQuestions.push(questionId);
              //  await targetStudent.save();

              await module.exports.Mutation.addCompletedQuestion(
                _,
                { questionId, studentId },
                context
              );
            }

            if (totalPossiblePoints === updatedPoints) {
              await moduleResolvers.Mutation.addCompletedModule(
                _,
                { moduleId, studentId },
                context
              );
            }
            // console.log(13);
            for (var targetBadge of badges) {
              await badgeResolvers.Mutation.handleAddBadge(
                _,
                { badgeId: targetBadge.id, studentId },
                context
              );
            }
            // console.log(14);
            await module.exports.Mutation.changeStudentIcon(
              _,
              { studentId },
              context
            );
            // console.log(15);
            return answerCorrect;
          }
        }
      }
    },
    async verifyAnswer(_, { answerId, questionId }, context) {
      try {
        const admin = checkAdminAuth(context);
      } catch (error) {
        try {
          const mentor = checkMentorAuth(context);
        } catch (error) {
          const student = checkStudentAuth(context);
        }
      }

      // await module.exports.Mutation.
      // FOR QUESTIONS WHERE EXPECTED ANS !null --> saveAnswer() --> verifyAnswer() --> incrementModulePoints w/ previous' returned value
      // FOR QUESTIONS WHERE EXPECTED ANS =null (no right ans) --> saveAnswer() --> incrementModulePoints w/ true
      // FOR SKILLS --> incrementModulePoints w/ true
      const targetQuestion = await Question.findById(questionId);
      const targetAnswer = await Answer.findById(answerId);
      const expectedAnswer = targetQuestion.expectedAnswer;
      if (
        !targetAnswer ||
        !targetQuestion ||
        !expectedAnswer ||
        expectedAnswer == ""
      ) {
        throw new UserInputError("Invalid input");
      } else if (targetAnswer.answer === expectedAnswer) {
        return true;
      } else {
        return false;
      }
    },
    async addCompletedQuestion(_, { studentId, questionId }, context) {
      // console.log("arriving here");

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
        await targetStudent.completedQuestions.push(questionId);
        await targetStudent.save();
        return targetStudent.completedQuestions;
      }
    },
    async addMentor(_, { mentorId, studentId }, context) {
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
      const targetMentor = await Mentor.findById(mentorId);
      if (
        !targetMentor ||
        !targetStudent ||
        targetStudent.mentors.includes(mentorId)
      ) {
        throw new UserInputError("Invalid input");
      } else {
        await targetStudent.mentors.push(mentorId);
        await targetStudent.save();
      }
      const updatedMentors = targetStudent.mentors;
      return updatedMentors;
    },

    async removeMentor(_, { mentorId, studentId }, context) {
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
      const targetMentor = await Mentor.findById(mentorId);
      if (
        !targetMentor ||
        !targetStudent ||
        !targetStudent.mentors.includes(mentorId)
      ) {
        throw new UserInputError("Invalid input");
      } else {
        const index = targetStudent.mentors.indexOf(mentorId);

        await targetStudent.mentors.splice(index, 1);
        await targetStudent.save();
      }
      const updatedMentors = targetStudent.mentors;
      return updatedMentors;
    },
    async changeStudentIcon(_, { studentId }, context) {
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
      // console.log(16);
      const targetStudent = await Student.findById(studentId);
      if (!targetStudent) {
        throw new UserInputError("Invalid input");
      }
      var points;
      // console.log(17);
      points = await module.exports.Query.getTotalPointsByStudent(
        _,
        { studentId },
        context
      );
      // console.log(18);
      if (points < 1000) {
        targetStudent.icon =
          "https://li-images.s3.amazonaws.com/3908900704/icon1.png";
      } else if (points >= 1000 && points <= 5000) {
        targetStudent.icon =
          "https://li-images.s3.amazonaws.com/9087019179/icon2.png";
      } else if (points >= 5000) {
        targetStudent.icon =
          "https://li-images.s3.amazonaws.com/7894807455/icon3.png";
      }
      targetStudent.save();
      // console.log(19);
      return targetStudent.icon;
    },
  },
};
