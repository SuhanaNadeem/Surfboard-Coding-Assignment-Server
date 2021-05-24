const checkMentorAuth = require("../../util/checkMentorAuth");
const checkStudentAuth = require("../../util/checkStudentAuth");
const checkAdminAuth = require("../../util/checkAdminAuth");

const Admin = require("../../models/Admin");
const Student = require("../../models/Student");
const Mentor = require("../../models/Mentor");
const Answer = require("../../models/Answer");

const { UserInputError, AuthenticationError } = require("apollo-server");
const Question = require("../../models/Question");
const StringStringDict = require("../../models/StringStringDict");

module.exports = {
  Query: {
    async getAnswerById(_, { answerId }, context) {
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

      const targetAnswer = await Answer.findById(answerId);
      if (!targetAnswer) {
        throw new UserInputError("Invalid input");
      } else {
        return targetAnswer;
      }
    },

    async getAnswers(_, {}, context) {
      try {
        var user = checkAdminAuth(context);
      } catch (error) {
        try {
          var user = checkMentorAuth(context);
        } catch (error) {
          throw new Error(error);
        }
      }
      const answers = await Answer.find();
      return answers;
    },
    async getAnswersByStudent(_, { studentId }, context) {
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
        const answers = await Answer.find({ studentId });
        // console.log(answer);
        return answers;
      } else {
        throw new UserInputError("Invalid input");
      }
    },
  },
  Mutation: {
    async deleteAnswer(_, { answerId, studentId }, context) {
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
      const targetAnswer = await Answer.findById(answerId);
      if (targetAnswer) {
        var quesAnsPair = await StringStringDict.findOne({
          value: answerId,
          studentId,
        });
        var index = -1;
        targetStudent.quesAnsDict.forEach(async function (targetQuesAnsPair) {
          if (
            targetQuesAnsPair.value === answerId &&
            targetQuesAnsPair.studentId === studentId
          ) {
            index = targetStudent.quesAnsDict.indexOf(targetQuesAnsPair);
          }
        });
        if (quesAnsPair && index != -1) {
          // const index = targetStudent.quesAnsDict.indexOf({
          //   value: answerId,
          //   studentId,
          // });

          targetStudent.quesAnsDict.splice(index, 1);
          await targetStudent.save();
          await quesAnsPair.delete();
        }
        await targetAnswer.delete();
        return "Delete Successful";
      } else {
        throw new UserInputError("Invalid input");
      }
    },
    async saveAnswer(_, { answer, studentId, questionId }, context) {
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        throw new AuthenticationError();
      }

      const targetQuestion = await Question.findById(questionId);
      var quesAnsPair = await StringStringDict.findOne({
        key: questionId,
        studentId,
      });
      var index = -1;
      targetStudent.quesAnsDict.forEach(async function (targetQuesAnsPair) {
        if (
          targetQuesAnsPair.key === questionId &&
          targetQuesAnsPair.studentId === studentId
        ) {
          index = targetStudent.quesAnsDict.indexOf(targetQuesAnsPair);
        }
      });

      if (!targetQuestion || !quesAnsPair || index === -1) {
        //hasnt started q or question DNE
        throw new UserInputError("Invalid input");
      } else {
        var answerModified;
        if (!answer) {
          answerModified = "";
        } else {
          answerModified = answer;
        }
        const newAnswer = new Answer({
          answer: answerModified,
          studentId,
          questionId,
          createdAt: new Date(),
        });
        await newAnswer.save();
        // const index = targetStudent.quesAnsDict.indexOf({
        //   key: questionId,
        //   studentId,
        // });

        targetStudent.quesAnsDict.splice(index, 1);
        await targetStudent.save();
        await quesAnsPair.delete();
        const newPair = new StringStringDict({
          key: questionId,
          value: newAnswer.id,
          studentId,
          createdAt: new Date(),
        });
        await newPair.save();
        targetStudent.quesAnsDict.push(newPair);
        // there's always only one quesAnsPair for a certain question
        await targetStudent.save();
        return newAnswer;
      }
    },
  },
};
