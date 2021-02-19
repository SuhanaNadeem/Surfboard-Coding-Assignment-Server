const { model, Schema } = require("mongoose");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const adminSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  name: String,
  password: String,
  email: String,
  modules: [String],
  questionTemplates: [String],
  challenges: [String],
  categories: [String],
  questions: [String],
  badges: [String],
  createdAt: Date,
});

module.exports = model("Admin", adminSchema);
