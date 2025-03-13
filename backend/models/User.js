// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: String,
  role: {
    type: String,
    enum: [
      "customer",
      "financeManager",
      "serviceManager",
      "supervisor",
      "painter",
    ],
    required: true,
  },
});

module.exports = mongoose.model("User", UserSchema);
