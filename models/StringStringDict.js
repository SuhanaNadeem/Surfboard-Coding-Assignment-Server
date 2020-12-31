const { model, Schema } = require("mongoose");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const stringStringDictSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  key: String,
  value: String,
  createdAt: Date,
});

module.exports = model("StringStringDict", stringStringDictSchema);
