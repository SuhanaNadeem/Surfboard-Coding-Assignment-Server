const { model, Schema } = require("mongoose");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const questionTemplateSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  type: String,
  categoryId: String,
  inputFields: [String], // TODO is this allowed
  createdAt: Date,
});

module.exports = model("Question Template", questionTemplateSchema);
