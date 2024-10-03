// routes/requestedRoutes.js
const express = require("express");
const router = express.Router();
const Requested = require("../models/Requested");

// Get all requested materials
router.get("/requested", async (req, res) => {
  try {
    const requestedMaterials = await Requested.find(); // Fetch all requested material records
    res.json(requestedMaterials); // Send the requested materials as JSON
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle any errors
  }
});

module.exports = router;
