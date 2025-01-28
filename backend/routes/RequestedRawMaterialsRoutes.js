// routes/requestedRoutes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
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

// Supply Material API Endpoint
router.post("/supply-material/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Find and update the requested material by ID
    const updatedRequest = await RequestedRawMaterials.findByIdAndUpdate(
      id,
      {
        status: "Supplied", // Set status to 'Supplied'
        supplyStatus: "Pending Acceptance", // Set supply status
        suppliedDate: new Date(), // Set current date for suppliedDate
      },
      { new: true } // Return the updated document
    );

    // If no document is found, return a 404 error
    if (!updatedRequest) {
      return res.status(404).json({ message: "Requested material not found" });
    }

    // Respond with a success message and the updated document
    res.status(200).json({
      message: "Raw material successfully supplied.",
      updatedRequest,
    });
  } catch (error) {
    console.error("Error in supply-material API:", error.message);

    // Return a 500 error with the message
    res.status(500).json({ message: error.message });
  }
});
// Get supplied materials (for inventory manager)
router.get("/supplied-materials", async (req, res) => {
  try {
    const materials = await RequestedRawMaterial.find({
      status: "Supplied",
      supplyStatus: "Pending Acceptance",
    }).sort({ suppliedDate: -1 });

    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept/Reject supplied material
router.put("/supplied-materials/:id/process", async (req, res) => {
  try {
    const { id } = req.params;
    const { action, remarks } = req.body;

    const updateData = {
      supplyStatus: action === "accept" ? "Accepted" : "Rejected",
      status: action === "accept" ? "Accepted" : "Supply Rejected",
      acceptanceDate: new Date(),
      remarks,
    };

    const updatedRequest = await RequestedRawMaterial.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
