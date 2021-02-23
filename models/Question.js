const { model, Schema } = require("mongoose");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const questionSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  image: String,
  description: String,
  expectedAnswer: String,
  createdAt: Date,
  hint: String,
  questionFormat: String,
  moduleId: String,
  points: Number,
  type: String,
  videoLink: String,
  articleLink: String,
  name: String,
  adminId: String,
  extraLink: String,
  optionA: String,
  optionB: String,
  optionC: String,
  optionD: String,
});

module.exports = model("Question", questionSchema);
