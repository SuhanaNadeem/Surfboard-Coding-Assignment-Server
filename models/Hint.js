const { model, Schema } = require("mongoose");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const hintSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  questionId: String,
  categoryId: String,
  moduleId: String,
  hintDescription: String,
  createdAt: Date,
});

module.exports = model("Hint", hintSchema);
