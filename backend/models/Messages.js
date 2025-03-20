const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true }, // e.g., "customer", "finance manager"
  receiver: { type: String, required: true }, // e.g., "finance manager", "driver"
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }, // Automatically set the timestamp
  customerName: { type: String, default: null }, // Only for customer messages
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
