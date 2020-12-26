const { model, Schema } = require("mongoose");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const commentSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  comment: String,
  personId: String,
  createdAt: Date,
});

module.exports = model("Comment", commentSchema);
