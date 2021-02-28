const { model, Schema } = require("mongoose");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const moduleSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  name: String,
  categoryId: String,
  comments: [String],
  questions: [String],
  createdAt: Date,
  learningObjectives: [String],
  adminId: String,
  image: String,
});

module.exports = model("Module", moduleSchema);
