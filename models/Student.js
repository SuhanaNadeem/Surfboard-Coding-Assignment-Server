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
  quesAnsDict: [{ _id: String, key: String, value: String, studentId: String }],
  modulePointsDict: [
    { _id: String, key: String, value: Number, studentId: String },
  ],
  mentors: [String],
  createdAt: Date,
});

module.exports = model("Student", studentSchema);
