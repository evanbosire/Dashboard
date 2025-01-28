// routes/requestedRoutes.js
const express = require("express");
const router = express.Router();
const Requested = require("../models/RequestedRawMaterials");

// POST route to handle raw material requests
router.post("/request-material", async (req, res) => {
  const { materialName, quantity, description, deliveryDate, supplier } =
    req.body;

  try {
    // Create a new requested material document
    const newRequestedMaterial = new Requested({
      material: materialName,
      requestedQuantity: quantity,
      description: description,
      supplier: supplier,
      deliveryDate: new Date(deliveryDate), // Convert string to Date object
    });

    // Save the document to the database
    await newRequestedMaterial.save();

    // Send a success response
    res.status(201).json({
      message: "Request submitted successfully",
      data: newRequestedMaterial,
    });
  } catch (err) {
    // Handle errors
    res.status(500).json({
      message: "Failed to submit request",
      error: err.message,
    });
  }
});

// GET all requested materials
router.get("/requested-materials", async (req, res) => {
  try {
    const requestedMaterials = await Requested.find(); // Fetch all requested materials
    res.status(200).json(requestedMaterials); // Send the data as JSON
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch requested materials",
      error: err.message,
    });
  }
});

// PUT route to update request status
router.put("/requested-materials/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedRequest = await Requested.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({
      message: "Request status updated successfully",
      data: updatedRequest,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update request status",
      error: err.message,
    });
  }
});

module.exports = router;
