const { model, Schema } = require("mongoose");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const questionSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  image: String,
  questionDescription: String,
  expectedAnswer: String,
  createdAt: Date,
  hint: String,
  questionTemplateId: String,
});

module.exports = model("Question", questionSchema);
