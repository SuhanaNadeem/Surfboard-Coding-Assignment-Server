const { model, Schema } = require("mongoose");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const stringIntDictSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  key: String,
  value: Number,
  createdAt: Date,
});

module.exports = model("StringIntDict", stringIntDictSchema);
