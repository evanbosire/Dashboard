// models/Messages.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  Sender: { type: String, required: true },
  Recipient: { type: String, required: true },
  Message: { type: String, required: true },
  Date: { type: Date, required: true },
  Reply: { type: String, required: true },
  ReplyDate: { type: Date, required: true },
});

module.exports = mongoose.model("Message", messageSchema);
