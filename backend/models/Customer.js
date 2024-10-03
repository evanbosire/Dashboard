const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const CustomerSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true, // Ensure customerName is required
  },
  gender: {
    type: String,
    required: true, // Ensure gender is required
  },
  phone: {
    type: String,
    required: true, // Ensure phone is required
  },
  email: {
    type: String,
    required: true, // Ensure email is required
    unique: true, // Ensure email is unique
  },
  location: {
    type: String,
    required: true, // Ensure location is required
  },
  status: {
    type: String,
    enum: ["pending", "active", "suspended", "rejected"], // Define possible states
    default: "pending", // Default status is pending
  },
  password: {
    type: String,
    required: true, // Ensure password is required
  },
});

// Hash password before saving
CustomerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const Customer = mongoose.model("Customer", CustomerSchema);

module.exports = Customer;
