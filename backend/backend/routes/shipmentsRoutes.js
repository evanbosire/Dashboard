// routes/shipmentsRoutes.js
const express = require("express");
const router = express.Router();
const Shipment = require("../models/Shipments");

// Get all shipments
router.get("/shipments", async (req, res) => {
  try {
    const shipments = await Shipment.find(); // Fetch all shipment records
    res.json(shipments); // Send the shipment records as JSON
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle any errors
  }
});

module.exports = router;
