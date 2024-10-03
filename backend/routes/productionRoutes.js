// routes/productionRoutes.js
const express = require("express");
const router = express.Router();
const Production = require("../models/Production");

// Get all productions
router.get("/productions", async (req, res) => {
  try {
    const productions = await Production.find(); // Fetch all records
    res.json(productions); // Send the data as JSON
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle any errors
  }
});

module.exports = router;
