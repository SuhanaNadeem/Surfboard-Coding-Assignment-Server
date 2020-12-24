const { model, Schema } = require("mongoose");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const practiceModuleSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  category: String,
  createdAt: Date,
});

module.exports = model("PracticeModule", practiceModuleSchema);
