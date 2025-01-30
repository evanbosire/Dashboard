// const express = require("express");
// const router = express.Router();
// const mongoose = require("mongoose");
// const Requested = require("../models/RequestedRawMaterials");

// // POST route to handle raw material requests
// router.post("/request-material", async (req, res) => {
//   const { materialName, quantity, description, deliveryDate, supplier } =
//     req.body;

//   try {
//     // Create a new requested material document
//     const newRequestedMaterial = new Requested({
//       material: materialName,
//       requestedQuantity: quantity,
//       description: description,
//       supplier: supplier,
//       deliveryDate: new Date(deliveryDate), // Convert string to Date object
//       status: "Pending", // Add default status
//       supplyStatus: "Not Supplied", // Add default supply status
//     });

//     // Save the document to the database
//     await newRequestedMaterial.save();

//     // Send a success response
//     res.status(201).json({
//       message: "Request submitted successfully",
//       data: newRequestedMaterial,
//     });
//   } catch (err) {
//     console.error("Error in request-material API:", err);
//     res.status(500).json({
//       message: "Failed to submit request",
//       error: err.message,
//     });
//   }
// });

// // GET all requested materials
// router.get("/requested-materials", async (req, res) => {
//   try {
//     const requestedMaterials = await Requested.find().sort({ createdAt: -1 }); // Add sorting by creation date
//     res.status(200).json({
//       message: "Materials fetched successfully",
//       data: requestedMaterials,
//     });
//   } catch (err) {
//     console.error("Error in get requested-materials API:", err);
//     res.status(500).json({
//       message: "Failed to fetch requested materials",
//       error: err.message,
//     });
//   }
// });

// // PUT route to update request status
// router.put("/requested-materials/:id", async (req, res) => {
//   const { id } = req.params;
//   const { status } = req.body;

//   try {
//     // Validate MongoDB ObjectId
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid ID format" });
//     }

//     const updatedRequest = await Requested.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     );

//     if (!updatedRequest) {
//       return res.status(404).json({ message: "Request not found" });
//     }

//     res.status(200).json({
//       message: "Request status updated successfully",
//       data: updatedRequest,
//     });
//   } catch (err) {
//     console.error("Error in update requested-materials API:", err);
//     res.status(500).json({
//       message: "Failed to update request status",
//       error: err.message,
//     });
//   }
// });

// // Supply Material API Endpoint
// router.post("/supply-material/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Check if the ID is a valid MongoDB ObjectId
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid ID format" });
//     }

//     // Find and update the requested material by ID
//     const updatedRequest = await Requested.findByIdAndUpdate(
//       id,
//       {
//         status: "Supplied",
//         supplyStatus: "Pending Acceptance",
//         suppliedDate: new Date(),
//       },
//       { new: true }
//     );

//     // If no document is found, return a 404 error
//     if (!updatedRequest) {
//       return res.status(404).json({ message: "Requested material not found" });
//     }

//     res.status(200).json({
//       message: "Raw material successfully supplied.",
//       data: updatedRequest,
//     });
//   } catch (error) {
//     console.error("Error in supply-material API:", error);
//     res.status(500).json({
//       message: "Failed to supply material",
//       error: error.message,
//     });
//   }
// });

// //GET all supplied materials sorted by suppliedDate in descending order
// router.get("/supplied-materials", async (req, res) => {
//   try {
//     const materials = await Requested.find({ status: "Supplied" }).sort({
//       suppliedDate: -1,
//     });

//     res.status(200).json(materials);
//   } catch (error) {
//     console.error("Error fetching supplied materials:", error);
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// });

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
//       remarks: remarks || "", // Handle case where remarks might be undefined
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

// // GET all accepted materials
// router.get("/accepted-materials", async (req, res) => {
//   try {
//     const acceptedMaterials = await Requested.find({ status: "Accepted" }).sort(
//       { acceptedDate: -1 }
//     ); // Add sorting by acceptance date if needed
//     res.status(200).json({
//       message: "Accepted materials fetched successfully",
//       data: acceptedMaterials,
//     });
//   } catch (err) {
//     console.error("Error in get accepted-materials API:", err);
//     res.status(500).json({
//       message: "Failed to fetch accepted materials",
//       error: err.message,
//     });
//   }
// });

// module.exports = router;

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

// Accept/Reject supplied material
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

    res.status(200).json({
      message: `Material ${action}ed successfully`,
      data: updatedRequest,
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

module.exports = router;
