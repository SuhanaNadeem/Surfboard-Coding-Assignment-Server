const { model, Schema } = require("mongoose");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const challengeSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  image: String,
  name: String,
  challengeDescription: String,
  createdAt: Date,
  categoryId: String,
  adminId: String,
  extraLink: String,
  dueDate: String,
});

module.exports = model("Challenge", challengeSchema);
