// routes/servicespaymentRoutes.js
const express = require("express");
const router = express.Router();
const ServicesPayment = require("../models/ServicesPayment");

// Get all services payments
router.get("/servicespayments", async (req, res) => {
  try {
    const servicesPayments = await ServicesPayment.find(); // Fetch all records
    res.json(servicesPayments); // Send the data as JSON
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle any errors
  }
});

module.exports = router;
