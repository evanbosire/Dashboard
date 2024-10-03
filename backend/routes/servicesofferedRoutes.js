// routes/servicesofferedRoutes.js
const express = require("express");
const router = express.Router();
const ServicesOffered = require("../models/ServicesOffered");

// Get all services offered
router.get("/servicesoffered", async (req, res) => {
  try {
    const servicesOffered = await ServicesOffered.find(); // Fetch all services offered records
    res.json(servicesOffered); // Send the services offered as JSON
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle any errors
  }
});

module.exports = router;
