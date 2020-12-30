const checkStudentAuth = require("../../util/checkStudentAuth");
const checkAdminAuth = require("../../util/checkAdminAuth");
const checkMentorAuth = require("../../util/checkMentorAuth");

const { UserInputError, AuthenticationError } = require("apollo-server");

const Question = require("../../models/Question");
const Admin = require("../../models/Admin");

module.exports = {
  Query: {
    async getQuestions(_, {}, context) {
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

      const question = await Question.find();

      if (!question) {
        throw new UserInputError("Invalid input");
      } else {
        return question;
      }
    },
    async getHintByQuestion(_, { questionId }, context) {
      const targetQuestion = Question.findById(questionId);
      if (!targetQuestion) {
        throw new UserInputError("Invalid input");
      } else {
        const targetHint = targetQuestion.hint;
        return targetHint;
      }
    },
    async getSavedAnswerByQuestion(_, { questionId }, context) {
      try {
        const student = checkStudentAuth(context);
        var targetStudent = await Student.findById(student.id);
      } catch (error) {
        console.log(error);
        return None;
      }
      const quesAnsPair = targetStudent.quesAnsDict.findOne({
        key: questionId,
      });
      if (quesAnsPair === null) {
        throw new UserInputError("Invalid input");
      } else {
        const savedAnswer = quesAnsPair.value;
        return savedAnswer;
      }
    },
  },

  // Mutation: {
  //   async createHint(_, { questionId, hintDescription }, context) {
  //     try {
  //       const admin = checkAdminAuth(context);
  //       var targetAdmin = await Admin.findById(admin.id);
  //     } catch (error) {
  //       throw new AuthenticationError();
  //     }
  //     const targetQuestion = Question.findById(questionId);
  //     if (targetQuestion) {
  //       const newHint = new Hint({
  //         questionId,
  //         hintDescription,
  //         createdAt: new Date(),
  //       });
  //       await newHint.save();
  //       targetQuestion.hintId = newHint.id;
  //       await targetQuestion.save();
  //       return newHint;
  //     } else {
  //       return new UserInputError("Invalid input");
  //     }
  //   },
  //   async editHint(_, { hintId, newHintDescription }, context) {
  //     try {
  //       const admin = checkAdminAuth(context);
  //       var targetAdmin = await Admin.findById(admin.id);
  //     } catch (error) {
  //       throw new AuthenticationError();
  //     }
  //     const targetHint = Hint.findById(hintId);
  //     if (targetHint) {
  //       targetHint.hintDescription = newHintDescription;
  //       await targetHint.save();
  //       return targetHint;
  //     }
  //     throw new UserInputError("Invalid input");
  //   },
  //   async deleteHint(_, { hintId, questionId }, context) {
  //     try {
  //       const admin = checkAdminAuth(context);
  //       var targetAdmin = await Admin.findById(admin.id);
  //     } catch (error) {
  //       throw new AuthenticationError();
  //     }
  //     const targetQuestion = Question.findById(questionId);
  //     const targetHint = Hint.findById(hintId);

  //     if (targetQuestion && targetHint) {
  //       await targetQuestion.hintId.delete();
  //       await targetQuestion.save();
  //       await targetHint.delete();
  //       return targetQuestion;
  //     }
  //     return new UserInputError("Invalid input");
  //   },
  // },
};
