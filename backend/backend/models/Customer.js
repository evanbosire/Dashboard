const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true, // Ensure this is set to true
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
  verified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  addresses: [
    {
      name: String,
      mobileNo: String,
      houseNo: String,
      street: String,
      landmark: String,
      city: String,
      county: String,
      postalCode: String,
    },
  ],
  orders: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Order",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Customer = mongoose.model("Customer", CustomerSchema);

module.exports = Customer;
