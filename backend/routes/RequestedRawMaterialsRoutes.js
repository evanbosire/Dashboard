const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Requested = require("../models/RequestedRawMaterials");

// POST route to handle raw material requests
router.post("/request-material", async (req, res) => {
  const { materialName, quantity, description, deliveryDate, supplier } =
    req.body;

  // Check if all required fields are present
  if (
    !materialName ||
    !quantity ||
    !description ||
    !deliveryDate ||
    !supplier
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Create a new requested material document
    const newRequestedMaterial = new Requested({
      material: materialName,
      requestedQuantity: quantity,
      description: description,
      supplier: supplier,
      deliveryDate: new Date(deliveryDate),
      status: "Requested", // Initial status
      supplyStatus: "Not Supplied", // Initial supply status
    });

    // Save the document to the database
    await newRequestedMaterial.save();

    // Send a success response
    res.status(201).json({
      message: "Request submitted successfully",
      data: newRequestedMaterial,
    });
  } catch (err) {
    console.error("Error in request-material API:", err);
    res.status(500).json({
      message: "Failed to submit request",
      error: err.message,
    });
  }
});

// GET all requested materials
router.get("/requested-materials", async (req, res) => {
  try {
    const requestedMaterials = await Requested.find().sort({
      dateRequested: -1,
    }); // Sorting by dateRequested
    res.status(200).json({
      message: "Materials fetched successfully",
      data: requestedMaterials,
    });
  } catch (err) {
    console.error("Error in get requested-materials API:", err);
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

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

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
    console.error("Error in update requested-materials API:", err);
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
    const { cost } = req.body; // Extract cost from the request body

    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Find and update the requested material by ID
    const updatedRequest = await Requested.findByIdAndUpdate(
      id,
      {
        status: "Supplied",
        supplyStatus: "Pending Acceptance",
        suppliedDate: new Date(),
        cost: cost, // Add the cost to the updated request
      },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Requested material not found" });
    }

    res.status(200).json({
      message: "Raw material successfully supplied.",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error in supply-material API:", error);
    res.status(500).json({
      message: "Failed to supply material",
      error: error.message,
    });
  }
});

// GET all supplied materials sorted by suppliedDate in descending order
router.get("/supplied-materials", async (req, res) => {
  try {
    const materials = await Requested.find({ status: "Supplied" }).sort({
      suppliedDate: -1,
    });

    res.status(200).json({
      message: "Supplied materials fetched successfully",
      data: materials,
    });
  } catch (error) {
    console.error("Error fetching supplied materials:", error);
    res.status(500).json({
      message: "Failed to fetch supplied materials",
      error: error.message,
    });
  }
});

// // Accept/Reject supplied material
// router.put("/supplied-materials/:id/process", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { action, remarks } = req.body;

//     // Validate MongoDB ObjectId
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid ID format" });
//     }

//     // Validate action
//     if (!action || !["accept", "reject"].includes(action)) {
//       return res
//         .status(400)
//         .json({ message: "Invalid action. Must be 'accept' or 'reject'" });
//     }

//     const updateData = {
//       supplyStatus: action === "accept" ? "Accepted" : "Rejected",
//       status: action === "accept" ? "Accepted" : "Supply Rejected",
//       acceptanceDate: new Date(),
//       remarks: remarks || "",
//     };

//     const updatedRequest = await Requested.findByIdAndUpdate(id, updateData, {
//       new: true,
//     });

//     if (!updatedRequest) {
//       return res.status(404).json({ message: "Requested material not found" });
//     }

//     res.status(200).json({
//       message: `Material ${action}ed successfully`,
//       data: updatedRequest,
//     });
//   } catch (error) {
//     console.error("Error in process supplied-materials API:", error);
//     res.status(500).json({
//       message: "Failed to process material",
//       error: error.message,
//     });
//   }
// });

router.put("/supplied-materials/:id/process", async (req, res) => {
  try {
    const { id } = req.params;
    const { action, remarks } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Validate action
    if (!action || !["accept", "reject"].includes(action)) {
      return res
        .status(400)
        .json({ message: "Invalid action. Must be 'accept' or 'reject'" });
    }

    const updateData = {
      supplyStatus: action === "accept" ? "Accepted" : "Rejected",
      status: action === "accept" ? "Accepted" : "Supply Rejected",
      acceptanceDate: new Date(),
      remarks: remarks || "",
    };

    const updatedRequest = await Requested.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedRequest) {
      return res.status(404).json({ message: "Requested material not found" });
    }

    // Calculate total cost
    const totalCost =
      updatedRequest.unitPrice * updatedRequest.requestedQuantity || 0;

    res.status(200).json({
      message: `Material ${action}ed successfully`,
      data: {
        ...updatedRequest.toObject(),
        totalCost,
        unitPrice: updatedRequest.unitPrice || 0,
        currency: "KSH",
      },
    });
  } catch (error) {
    console.error("Error in process supplied-materials API:", error);
    res.status(500).json({
      message: "Failed to process material",
      error: error.message,
    });
  }
});

// GET all accepted materials
router.get("/accepted-materials", async (req, res) => {
  try {
    const acceptedMaterials = await Requested.find({ status: "Accepted" }).sort(
      {
        acceptanceDate: -1,
      }
    );

    res.status(200).json({
      message: "Accepted materials fetched successfully",
      data: acceptedMaterials,
    });
  } catch (err) {
    console.error("Error in get accepted-materials API:", err);
    res.status(500).json({
      message: "Failed to fetch accepted materials",
      error: err.message,
    });
  }
});

// Pay for a material
router.post("/pay-material/:id", async (req, res) => {
  const { paymentCode, amountPaid, supplier } = req.body;
  try {
    const material = await Requested.findByIdAndUpdate(
      // Use Requested instead of Material
      req.params.id,
      { paymentStatus: "Paid", paymentCode, amountPaid, supplier },
      { new: true }
    );
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }
    res.status(201).json({ data: material });
  } catch (error) {
    console.error("Error during payment:", error); // Log error for debugging
    res
      .status(500)
      .json({ message: "Error during payment", error: error.message });
  }
});

module.exports = router;
