const { model, Schema } = require("mongoose");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const answerSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  studentId: String,
  questionId: String,
  categoryId: String,
  moduleId: String,
  createdAt: Date,
});

module.exports = model("Answer", answerSchema);
