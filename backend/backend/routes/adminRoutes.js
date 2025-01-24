const express = require("express");
const Admin = require("../models/Admin"); // Import the Admin model
const router = express.Router();
const bcrypt = require("bcryptjs"); // To hash passwords
const jwt = require("jsonwebtoken"); // For token creation (optional)

// Admin Registration Route
router.post("/register", async (req, res) => {
  const { id, name, email, password, phone } = req.body;

  try {
    // Check if the email is already registered
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin record
    const newAdmin = new Admin({
      id,
      name,
      email,
      password: hashedPassword,
      phone,
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering admin", error });
  }
});

// Admin Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare the password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // If needed, generate a token (optional)
    const token = jwt.sign({ id: admin._id }, "your_secret_key", {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

module.exports = router;
