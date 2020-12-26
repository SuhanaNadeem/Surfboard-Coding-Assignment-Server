const { model, Schema } = require("mongoose");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const categorySchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  name: String,
  modules: [String], // TODO have to be ids?
  challenges: [String], // TODO have to be ids?
  createdAt: Date,
});

module.exports = model("Category", categorySchema);
