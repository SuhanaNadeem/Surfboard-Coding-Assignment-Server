const { model, Schema } = require("mongoose");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const messageSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  text: String,
  sender: String,
});

module.exports = model("Message", messageSchema);
