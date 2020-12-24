const { model, Schema } = require("mongoose");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const mentorSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  name: String,
  orgName: String,
  password: String,
  email: String,
  createdAt: Date,
});

module.exports = model("Mentor", mentorSchema);
