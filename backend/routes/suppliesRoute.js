// routes/suppliesRoutes.js
const express = require("express");
const router = express.Router();
const Supplies = require("../models/Supplies");

// Get all shipments
router.get("/supplies", async (req, res) => {
  try {
    const supplies = await Supplies.find(); // Fetch all shipment records
    res.json(supplies); // Send the shipment records as JSON
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle any errors
  }
});

module.exports = router;
