const { model, Schema } = require("mongoose");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const fileSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  //   title: String,
  //   icon: String,
  //   createdAt: Date,
  // fileName: {
  //   type: String,
  //   default: "none",
  //   required: true,
  // },
  // fileData: {
  //   type: String,
  //   required: true,
  // },

  // filename: {
  filename: String,
  mimetype: String,
  encoding: String,
  url: String,
  createdAt: Date,
});

module.exports = model("File", fileSchema);
