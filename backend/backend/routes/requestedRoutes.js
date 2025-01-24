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

// Post a new requested material
router.post("/request-material", async (req, res) => {
  const { materialName, quantity, deliveryDate, supplier } = req.body;

  try {
    const newRequestedMaterial = new Requested({
      material: materialName,
      requestedQuantity: quantity,
      description: `Requested from ${supplier}`,
      status: "Requested",
      painter: "Inventory Manager", // Assuming the inventory manager is the one requesting
      dateRequested: new Date(),
    });

    await newRequestedMaterial.save();
    res.status(201).json(newRequestedMaterial);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
