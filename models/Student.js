const { model, Schema } = require("mongoose");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const studentSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  name: String,
  password: String,
  email: String,
  orgName: String,

  inProgressModules: [String],
  completedModules: [String],
  starredModules: [String],
  unstarredModules: [String],
  starredQuestions: [String],
  unstarredQuestions: [String],
  badges: [String],
  quesAnsDict: [{ key: String, value: String }],
  modulePointsDict: [{ key: String, value: Number }],

  createdAt: Date,
});

module.exports = model("Student", studentSchema);
