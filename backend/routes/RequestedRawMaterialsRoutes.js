const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Requested = require("../models/RequestedRawMaterials");
const Employee = require("../models/Employee");
const AllocatedMaterials = require("../models/AllocatedMaterials ");
const PDFDocument = require("pdfkit");

// // Inventory manager requests for raw materials from the supplier.
router.post("/request-material", async (req, res) => {
  const { materialName, quantity, unit, description, deliveryDate, supplier } =
    req.body;

  // Check if all required fields are present
  if (
    !materialName ||
    !quantity ||
    !unit ||
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
      unit: unit, // Store the unit in the database
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
// Inventory manager requests for raw materials from the supplier with the paint.
// router.post("/request-material", async (req, res) => {
//   const {
//     materialName,
//     quantity,
//     unit,
//     description,
//     deliveryDate,
//     supplier,
//     color,
//   } = req.body;

//   // Check if all required fields are present
//   if (
//     !materialName ||
//     !quantity ||
//     !unit ||
//     !description ||
//     !deliveryDate ||
//     !supplier
//   ) {
//     return res.status(400).json({ message: "All fields are required." });
//   }

//   try {
//     // Find the Inventory Manager
//     const inventoryManager = await Employee.findOne({
//       role: "Inventory manager",
//     });

//     if (!inventoryManager) {
//       return res.status(404).json({
//         message: "No Inventory Manager found in the system",
//       });
//     }

//     // Create a new requested material document
//     const newRequestedMaterial = new Requested({
//       material: materialName,
//       requestedQuantity: quantity,
//       unit: unit, // Store the unit in the database
//       description: description,
//       supplier: supplier,
//       deliveryDate: new Date(deliveryDate),
//       status: "Requested", // Initial status
//       supplyStatus: "Not Supplied", // Initial supply status
//       requestedBy: inventoryManager._id, // Automatically set the Inventory Manager
//       color: materialName === "Paint and Colorants" ? color : undefined, // Store the color if applicable
//     });

//     // Save the document to the database
//     await newRequestedMaterial.save();

//     // Fetch the saved material with populated requestedBy field
//     const populatedMaterial = await Requested.findById(
//       newRequestedMaterial._id
//     ).populate({
//       path: "requestedBy",
//       select: "role firstName lastName",
//     });

//     // Send a success response
//     res.status(201).json({
//       message: "Request submitted successfully",
//       data: populatedMaterial,
//     });
//   } catch (err) {
//     console.error("Error in request-material API:", err);
//     res.status(500).json({
//       message: "Failed to submit request",
//       error: err.message,
//     });
//   }
// });

// Supplier GET all requested materials by the inventory manager
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

// PUT route to update request status by the supplier to accept or decline the supply of raw materials
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

router.post("/supply-material/:id", async (req, res) => {
  try {
    const { id } = req.params; // ID of the requested material
    const { cost, costPerUnit } = req.body;

    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Find the requested material by ID
    const requestedMaterial = await Requested.findById(id);
    if (!requestedMaterial) {
      return res.status(404).json({ message: "Requested material not found" });
    }

    // Validate costPerUnit
    if (!costPerUnit || parseFloat(costPerUnit) <= 0) {
      return res.status(400).json({ message: "Invalid cost per unit." });
    }

    // Calculate the total cost (already calculated in the frontend, but we can validate it here)
    const calculatedTotalCost =
      parseFloat(costPerUnit) * requestedMaterial.requestedQuantity;

    if (calculatedTotalCost !== parseFloat(cost)) {
      return res.status(400).json({ message: "Cost calculation mismatch." });
    }

    // Check if the material already exists in the database
    const existingMaterial = await Requested.findOne({
      material: requestedMaterial.material,
      supplier: requestedMaterial.supplier, // Match the same supplier
      requestedBy: requestedMaterial.requestedBy, // Match the same requester
      status: "Supplied", // Ensure we only check supplied materials
    });

    if (existingMaterial) {
      // If the material exists, increment its quantity and update the cost
      existingMaterial.requestedQuantity += requestedMaterial.requestedQuantity;
      existingMaterial.cost += calculatedTotalCost; // Add to the total cost
      existingMaterial.costPerUnit = costPerUnit; // Update the cost per unit
      existingMaterial.suppliedDate = new Date(); // Update the supplied date
      await existingMaterial.save();

      res.status(200).json({
        message: "Raw material quantity incremented successfully.",
        data: existingMaterial,
      });
    } else {
      // If the material does not exist, create a new entry
      const newMaterial = new Requested({
        material: requestedMaterial.material,
        description: requestedMaterial.description,
        requestedQuantity: requestedMaterial.requestedQuantity,
        status: "Supplied",
        supplyStatus: "Pending Acceptance",
        suppliedDate: new Date(),
        cost: calculatedTotalCost,
        costPerUnit: costPerUnit,
        unit: requestedMaterial.unit,
        supplier: requestedMaterial.supplier,
        deliveryDate: requestedMaterial.deliveryDate,
        requestedBy: requestedMaterial.requestedBy,
        dateRequested: requestedMaterial.dateRequested,
      });
      await newMaterial.save();

      res.status(200).json({
        message: "New raw material created and supplied successfully.",
        data: newMaterial,
      });
    }
  } catch (error) {
    console.error("Error in supply-material API:", error);
    res.status(500).json({
      message: "Failed to supply material",
      error: error.message,
    });
  }
});

// GET all supplied materials by supplier to the inventory manager sorted by suppliedDate in descending order
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
    const material = await Requested.findById(id);

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

    // Supplier Information
    doc.text("Supplier Information:");
    doc.text(`* Name: ${material.supplier || "N/A"}`); // Access supplier name directly

    addSeparatorLine();

    // Item Description
    doc.text("Item Description:");
    doc.text(`* Material: ${material.material || "N/A"}`);
    doc.text(`* Quantity: ${material.requestedQuantity || "N/A"}`);
    doc.text(`* Total Cost: KSHS ${material.cost || "N/A"}`);

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
  const { material, requestedQuantity, description, unit } = req.body;

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
      requestedBy: productionManager._id,
      unit,
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

    const updatedMaterial = await Requested.findByIdAndUpdate(
      materialId,
      {
        $set: {
          requestedQuantity: remainingQuantity,
          allocatedQuantity: (rawMaterial.allocatedQuantity || 0) + quantity, // Track allocated quantity
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

    res.json({
      message: "Material allocated successfully",
      allocation: {
        material: updatedMaterial.material,
        allocatedQuantity: updatedMaterial.allocatedQuantity,
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
    const allocatedMaterials = await Requested.find({
      status: { $in: ["Allocated", "Partially Allocated"] },
      allocatedQuantity: { $gt: 0 }, // Only fetch materials that have been allocated
    })
      .populate({
        path: "requestedBy",
        select: "role firstName lastName",
      })
      .lean();

    if (allocatedMaterials.length === 0) {
      return res.status(404).json({
        message: "No raw materials found with the given criteria",
      });
    }

    // Transform the response to include allocated quantity
    const transformedMaterials = allocatedMaterials.map((material) => ({
      ...material,
      quantity: material.allocatedQuantity, // Include allocated quantity in response
      remainingQuantity: material.requestedQuantity, // Keep remaining quantity if needed
    }));

    res.status(200).json({
      message:
        "Allocated and partially allocated raw materials fetched successfully",
      allocatedMaterials: transformedMaterials,
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

    // Group materials with the same 'material' by summing requestedQuantity
    const groupedMaterials = materials.reduce((acc, item) => {
      const key = item.material; // Grouping by material name

      if (!acc[key]) {
        acc[key] = {
          ...item.toObject(),
          requestedQuantity: item.requestedQuantity, // Initialize with current quantity
          cost: item.cost, // Initialize with current cost
        };
      } else {
        acc[key].requestedQuantity += item.requestedQuantity; // Sum requestedQuantity
        acc[key].cost += item.cost; // Sum total cost
      }

      return acc;
    }, {});

    // Convert grouped object back to an array
    const result = Object.values(groupedMaterials);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Allocate materials to manufacturing by the production manager
router.post("/allocate/:materialId", async (req, res) => {
  const { materialId } = req.params;
  const { quantity } = req.body;

  try {
    // Validate quantity
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be a number greater than zero." });
    }

    // Find the material
    const rawMaterial = await Requested.findById(materialId);
    if (!rawMaterial) {
      return res.status(404).json({ message: "Material not found." });
    }

    // Ensure the quantity is a number
    const parsedQuantity = parseInt(quantity, 10);

    // Check if enough material is available
    if (rawMaterial.allocatedQuantity < parsedQuantity) {
      return res
        .status(400)
        .json({ message: "Not enough allocated materials." });
    }

    // Deduct the allocated quantity
    rawMaterial.allocatedQuantity -= parsedQuantity;

    // Update status based on the remaining allocated quantity
    if (rawMaterial.allocatedQuantity === 0) {
      rawMaterial.status = "Fully Allocated"; // No quantity left
    } else if (rawMaterial.allocatedQuantity > 0) {
      rawMaterial.status = "Partially Allocated"; // Some quantity left
    }

    // Save changes
    await rawMaterial.save();

    res.status(200).json({
      message: "Allocation successful",
      updatedMaterial: rawMaterial,
    });
  } catch (err) {
    console.error("Error allocating materials:", err);
    res.status(500).json({ error: err.message });
  }
});
// Get raw materials with status "Partially Allocated" or "Fully Allocated"
router.get("/manufacturing/allocated-materials", async (req, res) => {
  try {
    // Fetch materials with status "Partially Allocated" or "Fully Allocated"
    const materials = await Requested.find({
      status: { $in: ["Partially Allocated", "Fully Allocated"] },
    });

    // If no materials are found, return a 404 response
    if (materials.length === 0) {
      return res.status(404).json({ message: "No allocated materials found." });
    }

    // Return the materials with their details
    res.status(200).json({
      message: "Allocated materials retrieved successfully.",
      materials,
    });
  } catch (err) {
    console.error("Error fetching allocated materials:", err);
    res.status(500).json({ error: err.message });
  }
});
// New inventory -> production -> manufacturing raw materials process
// Allocate Raw Materials to Production Manager for Confirmation
router.post("/allocate-by-inventory", async (req, res) => {
  const { materialId, quantity } = req.body;

  try {
    const productionManager = await Employee.findOne({
      role: "Production manager",
    });
    if (!productionManager) {
      return res
        .status(400)
        .json({ message: "No Production Manager found in the system" });
    }

    const rawMaterial = await Requested.findById(materialId);
    if (!rawMaterial) {
      return res.status(404).json({ message: "Material not found" });
    }

    if (rawMaterial.requestedQuantity < quantity) {
      return res.status(400).json({
        message: "Not enough stock available",
        requested: quantity,
        available: rawMaterial.requestedQuantity,
      });
    }

    // Correct calculation: Reduce requestedQuantity and add to allocatedQuantity
    const updatedMaterial = await Requested.findByIdAndUpdate(
      materialId,
      {
        $inc: {
          requestedQuantity: -quantity, // Subtract allocated amount from requested
          allocatedQuantity: quantity, // Add to allocated amount
        },
        $set: {
          supplyInventoryStatus: "Pending Confirmation",
          allocatedBy: productionManager._id,
        },
      },
      { new: true }
    );

    res.json({
      message: "Material allocated successfully, awaiting confirmation",
      material: updatedMaterial,
    });
  } catch (err) {
    console.error("Error during allocation:", err);
    res.status(500).json({ error: err.message });
  }
});
// The production manager fetches the pending confirmation raw materials for confirmation
router.get("/pending-confirmation", async (req, res) => {
  try {
    const pendingMaterials = await Requested.find({
      supplyInventoryStatus: "Pending Confirmation",
    });

    if (pendingMaterials.length === 0) {
      return res
        .status(404)
        .json({ message: "No materials pending confirmation" });
    }

    res.json({ materials: pendingMaterials });
  } catch (err) {
    console.error("Error fetching pending confirmation materials:", err);
    res.status(500).json({ error: err.message });
  }
});
// Production manager confirms the raw materials
router.post("/confirm-by-production/:materialId", async (req, res) => {
  const { materialId } = req.params;

  try {
    const rawMaterial = await Requested.findById(materialId);
    if (!rawMaterial) {
      return res.status(404).json({ message: "Material not found" });
    }

    if (rawMaterial.supplyInventoryStatus !== "Pending Confirmation") {
      return res
        .status(400)
        .json({ message: "Material is not awaiting confirmation" });
    }

    // Update status to confirmed
    const updatedMaterial = await Requested.findByIdAndUpdate(
      materialId,
      {
        $set: {
          supplyInventoryStatus: "Confirmed", // Change status to confirmed
        },
      },
      { new: true }
    );

    res.json({
      message: "Material confirmed and ready for manufacturing",
      material: updatedMaterial,
    });
  } catch (err) {
    console.error("Error during confirmation:", err);
    res.status(500).json({ error: err.message });
  }
});
// Get all raw materials with supplyInventoryStatus "Confirmed" for the manufacturing team
router.get("/confirmed-materials", async (req, res) => {
  try {
    const confirmedMaterials = await Requested.find({
      supplyInventoryStatus: "Confirmed",
    });

    if (confirmedMaterials.length === 0) {
      return res.status(404).json({ message: "No confirmed materials found" });
    }

    res.json(confirmedMaterials);
  } catch (err) {
    console.error("Error fetching confirmed materials:", err);
    res.status(500).json({ error: err.message });
  }
});
// Manufacturing Team Receives the Raw Materials
router.post("/receive-by-manufacturing/:materialId", async (req, res) => {
  const { materialId } = req.params;

  try {
    const rawMaterial = await Requested.findById(materialId);
    if (!rawMaterial) {
      return res.status(404).json({ message: "Material not found" });
    }

    if (rawMaterial.supplyInventoryStatus !== "Confirmed") {
      return res
        .status(400)
        .json({ message: "Material is not confirmed for manufacturing" });
    }

    // Update status to received and reset allocatedQuantity
    const updatedMaterial = await Requested.findByIdAndUpdate(
      materialId,
      {
        $set: {
          supplyInventoryStatus: "Received by Manufacturing",
          allocatedQuantity: 0, // Reset allocated quantity
        },
      },
      { new: true }
    );

    res.json({
      message: "Material received by Manufacturing Team",
      material: updatedMaterial,
    });
  } catch (err) {
    console.error("Error during receiving process:", err);
    res.status(500).json({ error: err.message });
  }
});
// Get all received raw materials
router.get("/received-materials-by-manufacturing", async (req, res) => {
  try {
    const receivedMaterials = await Requested.find({
      supplyInventoryStatus: "Received by Manufacturing",
    });

    if (receivedMaterials.length === 0) {
      return res
        .status(404)
        .json({ message: "No materials received by manufacturing yet" });
    }

    res.json(receivedMaterials);
  } catch (err) {
    console.error("Error fetching received materials:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
