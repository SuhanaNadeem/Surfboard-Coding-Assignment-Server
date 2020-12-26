const { model, Schema } = require("mongoose");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const moduleSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  categoryId: String,
  format: String,
  comments: [String],
  questions: [String],
  createdAt: Date,
});

module.exports = model("Module", moduleSchema);
