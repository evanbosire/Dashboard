const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Requested = require("../models/RequestedRawMaterials");
const Employee = require("../models/Employee");
const PDFDocument = require("pdfkit");
const RequestedRawMaterials = require("../models/RequestedRawMaterials");

// POST route to handle raw material requests by the inventory manager
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
    // Find the Inventory Manager
    const inventoryManager = await Employee.findOne({
      role: "Inventory manager",
    });

    if (!inventoryManager) {
      return res.status(404).json({
        message: "No Inventory Manager found in the system",
      });
    }

    // Create a new requested material document
    const newRequestedMaterial = new Requested({
      material: materialName,
      requestedQuantity: quantity,
      description: description,
      supplier: supplier,
      deliveryDate: new Date(deliveryDate),
      status: "Requested", // Initial status
      supplyStatus: "Not Supplied", // Initial supply status
      requestedBy: inventoryManager._id, // Automatically set the Inventory Manager
    });

    // Save the document to the database
    await newRequestedMaterial.save();

    // Fetch the saved material with populated requestedBy field
    const populatedMaterial = await Requested.findById(
      newRequestedMaterial._id
    ).populate({
      path: "requestedBy",
      select: "role firstName lastName",
    });

    // Send a success response
    res.status(201).json({
      message: "Request submitted successfully",
      data: populatedMaterial,
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

router.get("/download-receipt/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    const material = await Requested.findById(id).populate("customer supplier");
    console.log("Material Details:", material);

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    // Create a PDF document
    const doc = new PDFDocument();

    // Set response headers before sending any data
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt_${id}.pdf`
    );

    // Pipe the PDF directly to the response
    doc.pipe(res);

    // Helper function to add separator line
    const addSeparatorLine = () => {
      doc.text("-----------------------------------------------", {
        align: "left",
      });
    };

    addSeparatorLine();

    // Company header
    doc.fontSize(18).text("CORRUGATED SHEETS LIMITED", { align: "center" });
    doc.fontSize(12).text("Receipt for Material Supply", { align: "center" });
    doc.fontSize(10).text("www.corrugatedsheetsltd.com", { align: "center" });

    addSeparatorLine();
    addSeparatorLine();

    // Receipt details
    doc
      .fontSize(10)
      .text(`Receipt Number: ${material._id}`, {
        align: "left",
        continued: true,
      })
      .text(`Date: ${new Date().toISOString().split("T")[0]}`, {
        align: "right",
      });

    addSeparatorLine();

    // Item Description
    doc.text("Item Description:");
    doc.text(`* Material: ${material.material || "N/A"}`);
    doc.text(`* Quantity: ${material.requestedQuantity || "N/A"}`);
    doc.text(`* Total Cost: ${material.cost || "N/A"} KSH`);

    addSeparatorLine();

    // Payment Information
    doc.text("Payment Information:");
    doc.text(`Transaction Ref. No: ${material.paymentCode || "N/A"}`);
    doc.text(`Payment Status: ${material.paymentStatus || "N/A"}`);

    addSeparatorLine();

    // Summary
    doc.text("Summary:");
    doc.text(`Total Amount: ${material.cost || 0} KSH`);
    doc.text(`Delivery Status: ${material.status || "N/A"}`);
    if (material.remarks) {
      doc.text(`Remarks: ${material.remarks}`);
    }

    addSeparatorLine();

    // Footer
    doc.text("Thank you for your business!", { align: "left" });

    addSeparatorLine();

    // End the document
    doc.end();
  } catch (err) {
    console.error("Error in generating receipt:", err);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Failed to generate receipt",
        error: err.message,
      });
    }
  }
});
// //  Inventory Manager Requests Products to be Manufactured
// router.post("/request-manufacturing", async (req, res) => {
//   try {
//     const { material, requestedQuantity, description } = req.body;

//     if (!material || !requestedQuantity || !description) {
//       return res
//         .status(400)
//         .json({ error: "Material, quantity, and description are required" });
//     }

//     const newRequest = new Requested({
//       material,
//       requestedQuantity,
//       description,
//       status: "Requested",
//       supplier: "Internal",
//       deliveryDate: new Date(),
//     });

//     await newRequest.save();

//     res.status(201).json({
//       message: "Manufacturing request sent successfully",
//       request: newRequest,
//     });
//   } catch (err) {
//     console.error("Error saving manufacturing request:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
// Inventory Manager Requests Products to be Manufactured
router.post("/request-manufacturing", async (req, res) => {
  try {
    const { material, requestedQuantity, description } = req.body;

    // Check if the required fields are present
    if (!material || !requestedQuantity || !description) {
      return res
        .status(400)
        .json({ error: "Material, quantity, and description are required" });
    }

    // Hardcode the Inventory Manager's ID (replace with actual ID)
    const inventoryManagerId = "678e837e3e192d6f4257daaa"; // Example Inventory Manager ID

    // Create the new request and automatically add the Inventory Manager's ID
    const newRequest = new Requested({
      material,
      requestedQuantity,
      description,
      status: "Requested",
      supplier: "Internal",
      deliveryDate: new Date(),
      requestedBy: inventoryManagerId, // Automatically set requestedBy to the Inventory Manager's ID
    });

    // Save the new request to the database
    await newRequest.save();

    // Respond with a success message
    res.status(201).json({
      message: "Manufacturing request sent successfully",
      request: newRequest,
    });
  } catch (err) {
    console.error("Error saving manufacturing request:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// production manager views requested products by the inventory
router.get("/view-manufacturing-requests", async (req, res) => {
  try {
    // Fetch all manufacturing requests from the database
    const manufacturingRequests = await Requested.find({
      supplier: "Internal",
    }).lean(); // Convert Mongoose documents to plain objects

    // Debugging log to check fetched data
    console.log("Fetched Manufacturing Requests:", manufacturingRequests);

    if (manufacturingRequests.length === 0) {
      return res.status(404).json({
        message: "No manufacturing requests found from Inventory Managers",
      });
    }

    res.status(200).json({
      message: "Manufacturing requests fetched successfully",
      requests: manufacturingRequests,
    });
  } catch (err) {
    console.error("Error fetching manufacturing requests:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// production manager requests raw material to manufactur the requested product by inventory
router.post("/request-raw-materials", async (req, res) => {
  const { material, requestedQuantity, description } = req.body;

  try {
    // First find a Production Manager
    const productionManager = await Employee.findOne({
      role: "Production manager",
    });
    console.log("my production:", productionManager);
    if (!productionManager) {
      return res.status(400).json({
        message: "No Production Manager found in the system",
      });
    }

    const newRequest = new Requested({
      material,
      requestedQuantity,
      description,
      status: "Requested",
      supplier: "Supplier Name",
      deliveryDate: new Date(),
      requestedBy: productionManager._id, // Automatically use the Production Manager's ID
    });

    await newRequest.save();
    res.json({
      message: "Raw material request sent successfully",
      newRequest,
      requestedBy: {
        name: `${productionManager.firstName} ${productionManager.lastName}`,
        role: productionManager.role,
      },
    });
  } catch (err) {
    console.error("Error creating request:", err);
    res.status(500).json({ error: err.message });
  }
});
// Inventory to view requested raw materials by production manager
router.get("/view-raw-material-requests", async (req, res) => {
  try {
    // Fetch requests and populate the 'requestedBy' field
    const requests = await Requested.find({})
      .populate({
        path: "requestedBy", // Populating the requestedBy field to get employee details
        select: "role firstName lastName", // Selecting relevant fields
      })
      .lean(); // Convert Mongoose documents to plain objects

    // Filter requests to only those made by a Production Manager
    const filteredRequests = requests.filter(
      (request) => request.requestedBy?.role === "Production manager"
    );

    if (filteredRequests.length === 0) {
      return res.status(404).json({
        message: "No raw material requests found from Production Managers",
      });
    }
    res.status(200).json({
      message: "Requests fetched successfully",
      requests: filteredRequests,
    });
  } catch (err) {
    console.error("Error fetching requests:", err); // Log the error for debugging
    res.status(500).json({ error: err.message });
  }
});

// Allocate Raw Materials to Production Manager
router.post("/allocate", async (req, res) => {
  const { materialId, quantity } = req.body;
  try {
    const productionManager = await Employee.findOne({
      role: "Production manager",
    });
    if (!productionManager) {
      return res.status(400).json({
        message: "No Production Manager found in the system",
      });
    }
    const rawMaterial = await Requested.findById(materialId).populate({
      path: "requestedBy",
      select: "role firstName lastName",
    });

    if (!rawMaterial) {
      return res.status(404).json({ message: "Material not found" });
    }

    if (!quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Please provide a valid quantity" });
    }
    if (rawMaterial.requestedQuantity < quantity) {
      return res.status(400).json({
        message: "Not enough stock available",
        requested: quantity,
        available: rawMaterial.requestedQuantity,
      });
    }
    const remainingQuantity = rawMaterial.requestedQuantity - quantity;
    const newStatus =
      remainingQuantity === 0 ? "Allocated" : "Partially Allocated";

    console.log(
      `Updating material ID ${materialId} - Remaining Quantity: ${remainingQuantity}, New Status: ${newStatus}`
    );

    const updatedMaterial = await Requested.findByIdAndUpdate(
      materialId,
      {
        $set: {
          requestedQuantity: remainingQuantity,
          status: newStatus,
          supplyStatus: "Pending Acceptance",
          allocatedBy: productionManager._id,
        },
      },
      { new: true }
    ).populate({
      path: "requestedBy",
      select: "role firstName lastName",
    });
    console.log("Updated Material:", updatedMaterial);
    res.json({
      message: "Material allocated successfully",
      allocation: {
        material: updatedMaterial.material,
        allocatedQuantity: quantity,
        remainingQuantity: updatedMaterial.requestedQuantity,
        status: updatedMaterial.status,
        supplyStatus: updatedMaterial.supplyStatus,
        originalRequestedBy: {
          id: updatedMaterial.requestedBy._id,
          name: `${updatedMaterial.requestedBy.firstName} ${updatedMaterial.requestedBy.lastName}`,
          role: updatedMaterial.requestedBy.role,
        },
        allocatedBy: {
          id: productionManager._id,
          name: `${productionManager.firstName} ${productionManager.lastName}`,
          role: productionManager.role,
        },
      },
    });
  } catch (err) {
    console.error("Error during allocation:", err);
    res.status(500).json({ error: err.message });
  }
});
// Fetch Raw Materials Allocated to the Production Manager
router.get("/allocated-materials", async (req, res) => {
  try {
    // Fetch materials that have been allocated (status changed or quantity modified)
    const allocatedMaterials = await Requested.find({
      status: "Allocated", // Assuming you update the status when allocating
    })
      .populate({
        path: "requestedBy",
        select: "role firstName lastName", // Select relevant user details
      })
      .lean(); // Convert Mongoose docs to plain objects
    if (allocatedMaterials.length === 0) {
      return res.status(404).json({
        message: "No allocated raw materials found",
      });
    }
    res.status(200).json({
      message: "Allocated raw materials fetched successfully",
      allocatedMaterials,
    });
  } catch (err) {
    console.error("Error fetching allocated materials:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update Stock When Raw Materials Are Received
router.put("/update-stock/:id", async (req, res) => {
  try {
    const material = await Requested.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    material.status = "Accepted"; // Mark as accepted
    material.supplyStatus = "Accepted"; // Update supply status
    material.acceptanceDate = new Date();
    material.requestedQuantity += req.body.additionalQuantity; // Increase stock
    await material.save();

    res.json({ message: "Stock updated successfully", material });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stock", async (req, res) => {
  try {
    const materials = await Requested.find({
      status: { $in: ["Partially Allocated", "Accepted"] },
    });
    res.status(200).json(materials);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
