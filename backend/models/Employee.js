// models/Employee.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const EmployeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true, // Ensure firstName is required
  },
  lastName: {
    type: String,
    required: true, // Ensure lastName is required
  },
  gender: {
    type: String,
    required: true, // Ensure gender is required
  },
  phoneNumber: {
    type: String,
    required: true, // Ensure phoneNumber is required
  },
  email: {
    type: String,
    required: true, // Ensure email is required
    unique: true, // Ensure email is unique
  },
  role: {
    type: String,
    required: true, // Ensure role is required
  },
  county: {
    type: String,
    required: true, // Ensure county is required
  },

  status: {
    type: String,
    enum: ["active", "inactive"], // Define possible states
    default: "active", // Default status is active
  },
  password: {
    type: String,
    required: true, // Ensure password is required
  },
});

// Hash password before saving
EmployeeSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const Employee = mongoose.model("Employee", EmployeeSchema);

module.exports = Employee;
