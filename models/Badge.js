const { model, Schema } = require("mongoose");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const badgeSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  name: String,
  description: String,
  type: String,
  requiredAmount: Number,
  image: String,
  createdAt: Date,
  adminId: String,
});

module.exports = model("Badge", badgeSchema);
