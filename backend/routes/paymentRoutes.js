const express = require("express");
const router = express.Router();
const { Payment } = require("../models/Payment");

// Get all payments
router.get("/payments", async (req, res) => {
  try {
    const payments = await Payment.find().populate("id"); // Populate with Order data if needed
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
