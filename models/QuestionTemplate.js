const { model, Schema } = require("mongoose");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const questionTemplateSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  categoryId: String,
  inputFields: [String],
  createdAt: Date,
  name: String,
  adminId: String,
});

module.exports = model("Question Template", questionTemplateSchema);
