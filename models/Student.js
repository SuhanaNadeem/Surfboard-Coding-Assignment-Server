const { model, Schema } = require("mongoose");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);
const StringStringDict = require("../../models/StringStringDict");
const StringIntDict = require("../../models/StringIntDict");

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
  badges: [String],
  quesAnsDict: [StringStringDict],
  modulePointsDict: [StringIntDict], // TODO setting this and the above up

  createdAt: Date,
});

module.exports = model("Student", studentSchema);
