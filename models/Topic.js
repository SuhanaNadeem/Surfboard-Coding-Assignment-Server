const { model, Schema } = require("mongoose");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const topicSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  title: String,
  description: String,
  timeEstimate: Number,
  imageLink: String,
});

module.exports = model("Topic", topicSchema);
