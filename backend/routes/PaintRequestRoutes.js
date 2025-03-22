const express = require("express");
const router = express.Router();
const PaintRequest = require("../models/PaintRequest");
const PainterAllocation = require("../models/PainterAllocationSchema ")
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Tool = require("../models/ToolSchema ");
const Painter = require("../models/PainterSchema");

// 1. Inventory Manager Requests Paint
router.post("/request-paint", async (req, res) => {
  const { color, quantity, description, deliveryDate, supplier } = req.body;

  try {
    const newRequest = new PaintRequest({
      color,
      quantity,
      description,
      deliveryDate,
      supplier,
      status: "Pending",
    });

    await newRequest.save();

    res.status(201).json({
      message: "Paint request submitted successfully",
      data: newRequest,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to submit request", error: err.message });
  }
});
// Get all paint requests with a "Pending" status
router.get("/pending-paint-requests", async (req, res) => {
  try {
    const pendingRequests = await PaintRequest.find({ status: "Pending" });

    res.status(200).json({
      message: "Pending paint requests retrieved successfully",
      data: pendingRequests,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to retrieve pending requests",
      error: err.message,
    });
  }
});

// 2. Supplier Approves or Rejects the Request
router.put("/approve-request/:requestId", async (req, res) => {
  const { status, pricePerUnit } = req.body;

  try {
    const request = await PaintRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = status;
    if (status === "Approved") {
      request.pricePerUnit = pricePerUnit;
      request.totalPrice = pricePerUnit * request.quantity;
    }

    await request.save();

    res.status(200).json({
      message: `Request ${status.toLowerCase()} successfully`,
      data: request,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update request", error: err.message });
  }
});
router.get("/paints/approved", async (req, res) => {
  try {
    const approvedPaints = await PaintRequest.find({ status: "Approved" });
    res.status(200).json(approvedPaints);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// 3. Supplier Supplies the Paint
router.put("/supply-paint/:requestId", async (req, res) => {
  try {
    const request = await PaintRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "Supplied";
    await request.save();

    res.status(200).json({
      message: "Paint supplied successfully",
      data: request,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update request", error: err.message });
  }
});
// Inventory Gets all supplied paints
router.get("/supplied-paints", async (req, res) => {
  try {
    const suppliedRequests = await PaintRequest.find({ status: "Supplied" });

    res.status(200).json({
      message: "supplied paint requests retrieved successfully",
      data: suppliedRequests,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to retrieve supplied requests",
      error: err.message,
    });
  }
});

// 4. Inventory Manager Marks the Paint as Received
router.put("/receive-paint/:requestId", async (req, res) => {
  try {
    const request = await PaintRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "Received";
    await request.save();

    res.status(200).json({
      message: "Paint received successfully",
      data: request,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update request", error: err.message });
  }
});

// 5. Finance Manager Fetches Received Paints
router.get("/received-paints", async (req, res) => {
  try {
    const paints = await PaintRequest.find({
      status: "Received",
      paymentStatus: "Unpaid",
    });

    res.status(200).json({
      message: "Received paints fetched successfully",
      data: paints,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch paints", error: err.message });
  }
});

// Finance Manager Pays for the Supply
router.post("/pay-supply/:requestId", async (req, res) => {
  const { paymentCode, amountPaid } = req.body;

  try {
    const request = await PaintRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "Received") {
      return res
        .status(400)
        .json({ message: "Payment can only be made for received paints" });
    }

    if (request.paymentStatus === "Paid") {
      return res
        .status(400)
        .json({ message: "This request has already been paid for" });
    }

    // Ensure the amount paid matches the total price
    if (amountPaid !== request.totalPrice) {
      return res.status(400).json({
        message: `Amount should be exactly ${request.totalPrice}`,
      });
    }

    request.paymentStatus = "Paid";
    request.paymentCode = paymentCode;
    request.amountPaid = amountPaid; // Store the paid amount
    await request.save();

    res.status(200).json({
      message: "Payment successful",
      data: request,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to process payment", error: err.message });
  }
});

// Supplier Downloads Payment Receipt
router.get("/download-receipt/:requestId", async (req, res) => {
  try {
    const request = await PaintRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.paymentStatus !== "Paid") {
      return res
        .status(400)
        .json({ message: "Receipt can only be generated for paid requests" });
    }

    // Create a new PDF document
    const doc = new PDFDocument();
    const receiptPath = path.join(__dirname, `receipt-${request._id}.pdf`);
    const writeStream = fs.createWriteStream(receiptPath);
    doc.pipe(writeStream);

    // Company Name
    doc.fontSize(18).text("Corrugated Sheets Limited", { align: "center" });
    doc.moveDown();

    // Receipt Title
    doc
      .fontSize(20)
      .text("Payment Receipt", { align: "center", underline: true });
    doc.moveDown();

    // Supplier & Request Details
    doc.fontSize(12).text(`Supplier Name: ${request.supplier}`);
    doc.text(`Company: Corrugated Sheets Limited`);
    doc.text(`Request ID: ${request._id}`);
    doc.text(`Color: ${request.color}`);
    doc.text(`Quantity: ${request.quantity}`);
    doc.text(`Description: ${request.description}`);
    doc.text(`Delivery Date: ${new Date(request.deliveryDate).toDateString()}`);
    doc.text(`Price per Unit: KES ${request.pricePerUnit.toLocaleString()}`);
    doc.text(`Total Price: KES ${request.totalPrice.toLocaleString()}`);
    doc.text(`Payment Status: ${request.paymentStatus}`);
    doc.text(`Payment Code: ${request.paymentCode}`);
    doc.moveDown();

    // Footer
    doc.fontSize(14).text("Thank you for your business!", { align: "center" });

    // Finalize PDF
    doc.end();

    // Send the file after it’s fully written
    writeStream.on("finish", () => {
      res.download(receiptPath, `Receipt-${request._id}.pdf`, (err) => {
        if (err) {
          res
            .status(500)
            .json({ message: "Error downloading receipt", error: err.message });
        }
        // Delete the file after sending to free up space
        fs.unlinkSync(receiptPath);
      });
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to generate receipt", error: err.message });
  }
});

// 8. Inventory Manager Views Available Paints as paint stock
router.get("/available-paints", async (req, res) => {
  try {
    const paints = await PaintRequest.find({ status: "Received" });

    res.status(200).json({
      message: "Available paints fetched successfully",
      data: paints,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch paints", error: err.message });
  }
});
// 9. Inventory Manager Allocates Paint to Painter
router.post("/allocate-paint/:paintId", async (req, res) => {
  try {
    const { paintId } = req.params; // Get paintId from URL
    const { quantity } = req.body; // Get quantity from request body

    // Validate input
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity to allocate" });
    }

    // Find the paint in stock
    const paint = await PaintRequest.findById(paintId);
    if (!paint) {
      return res.status(404).json({ message: "Paint not found" });
    }

    // Check if the paint is available (status is "Received")
    if (paint.status !== "Received") {
      return res
        .status(400)
        .json({ message: "Paint is not available for allocation" });
    }

    // Check if there is enough quantity to allocate
    if (paint.quantity < quantity) {
      return res
        .status(400)
        .json({ message: "Insufficient paint quantity in stock" });
    }

    // Deduct allocated quantity from stock
    paint.quantity -= quantity;
    await paint.save();

    // Create allocation record
    const allocation = new PainterAllocation({
      paintId,
      allocatedQuantity: quantity,
    });

    await allocation.save();

    res.status(200).json({
      message: "Paint allocated successfully",
      data: allocation,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to allocate paint",
      error: err.message,
    });
  }
});

// 10. Inventory Manager Views Allocated Paints
router.get("/allocated-paints", async (req, res) => {
  try {
    // Aggregate to group by color and sum allocated quantities
    const allocations = await PainterAllocation.aggregate([
      // Populate the paintId field to access the color
      {
        $lookup: {
          from: "paintrequests", // Collection name for PaintRequest
          localField: "paintId",
          foreignField: "_id",
          as: "paintDetails",
        },
      },
      // Unwind the paintDetails array (since $lookup returns an array)
      { $unwind: "$paintDetails" },
      // Group by color and sum allocated quantities
      {
        $group: {
          _id: "$paintDetails.color", // Group by color
          totalAllocatedQuantity: { $sum: "$allocatedQuantity" }, // Sum allocated quantities
          allocations: { $push: "$$ROOT" }, // Keep the original documents for reference (optional)
        },
      },
      // Format the output
      {
        $project: {
          _id: 0, // Exclude the default _id field
          color: "$_id", // Rename _id to color
          totalAllocatedQuantity: 1, // Include totalAllocatedQuantity
          allocations: 1, // Include the original documents (optional)
        },
      },
    ]);

    // If no allocations are found, return a 404 response
    if (!allocations || allocations.length === 0) {
      return res.status(404).json({ message: "No paint allocations found" });
    }

    // Return the grouped allocations
    res.status(200).json({
      message: "Allocated paints fetched successfully",
      data: allocations,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch allocated paints",
      error: err.message,
    });
  }
});

// Inventory Manager adds or updates a tool.
router.post("/add-tool", async (req, res) => {
  try {
    const { name, quantity, unit } = req.body;

    // Validate input
    if (!name || !quantity || quantity <= 0 || !unit) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    // Valid unit check
    const validUnits = [
      "pieces",
      "sheets",
      "units",
      "liters",
      "tubes",
      "pairs",
      "sets",
      "rolls",
    ];
    if (!validUnits.includes(unit)) {
      return res.status(400).json({ message: "Invalid unit type" });
    }

    // Check if the tool already exists
    let tool = await Tool.findOne({ name });

    if (tool) {
      // Ensure the unit matches before updating quantity
      if (tool.unit !== unit) {
        return res
          .status(400)
          .json({
            message: `Unit mismatch! Existing tool '${name}' uses '${tool.unit}'.`,
          });
      }

      // Update quantity if tool exists
      tool.quantity += quantity;
      tool.status = "Available";
      await tool.save();

      return res.status(200).json({
        message: "Tool quantity updated successfully",
        data: tool,
      });
    }

    // If tool does not exist, create a new tool
    tool = new Tool({ name, quantity, unit, status: "Available" });
    await tool.save();

    return res.status(201).json({
      message: "Tool added successfully",
      data: tool,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to add or update tool",
      error: err.message,
    });
  }
});

// Inventory Manager views available tools
router.get("/tools", async (req, res) => {
  try {
    const tools = await Tool.find();

    res.status(200).json({
      message: "Tools fetched successfully",
      data: tools,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch tools",
      error: err.message,
    });
  }
});
// Inventory Manager Releases Tools
router.post("/release-tool", async (req, res) => {
  try {
    const { name, quantity, unit } = req.body;

    // Validate input
    if (!name || !quantity || quantity <= 0 || !unit) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    // Find the tool
    const tool = await Tool.findOne({ name });
    if (!tool) {
      return res.status(404).json({ message: "Tool not found" });
    }

    // Validate the unit
    if (tool.unit !== unit) {
      return res.status(400).json({
        message: `Invalid unit. Expected: ${tool.unit}, but got: ${unit}`,
      });
    }

    // Check if there is enough quantity to release
    if (tool.quantity < quantity) {
      return res.status(400).json({
        message: `Insufficient quantity. Available: ${tool.quantity} ${tool.unit}`,
      });
    }

    // Reduce tool quantity and mark as "Released"
    tool.quantity -= quantity;
    tool.status = "Released";
    tool.releasedAt = new Date();
    await tool.save();

    res.status(200).json({
      message: `Tool '${name}' released successfully. ${tool.quantity} ${tool.unit} remaining.`,
      data: {
        name: tool.name,
        quantity: tool.quantity,
        unit: tool.unit,
        status: tool.status,
        releasedAt: tool.releasedAt,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to release tool",
      error: err.message,
    });
  }
});
// Inventory Manager Views Requested Tools
router.get("/view-requested-tools", async (req, res) => {
  try {
    // Fetch all tool requests
    const requestedTools = await Tool.find({ quantity: { $lt: 100 } }) // Assuming 100 is the restock threshold
      .select("name quantity unit status releasedAt")
      .sort({ releasedAt: -1 });

    if (!requestedTools.length) {
      return res.status(404).json({ message: "No tool requests found" });
    }

    res.status(200).json({
      message: "Requested tools retrieved successfully",
      data: requestedTools,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch requested tools",
      error: err.message,
    });
  }
});

// Painter Requests Tools
router.post("/request-tools", async (req, res) => {
  try {
    const { name, quantity, unit } = req.body;

    // Validate input
    if (!name || !quantity || quantity <= 0 || !unit) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    // Find the tool
    const tool = await Tool.findOne({ name });

    if (!tool) {
      return res.status(404).json({ message: "Tool not found" });
    }

    // Check if the unit matches the existing tool's unit
    if (tool.unit !== unit) {
      return res.status(400).json({
        message: `Unit mismatch! Existing tool '${name}' uses '${tool.unit}', but '${unit}' was requested.`,
      });
    }

    // Check if the tool is available in sufficient quantity
    if (tool.quantity < quantity) {
      return res.status(400).json({
        message: `Insufficient tool quantity. Available: ${tool.quantity} ${tool.unit}`,
      });
    }

    // Reduce tool quantity
    tool.quantity -= quantity;
    tool.status = tool.quantity > 0 ? "Available" : "Out of Stock"; // Mark as 'Out of Stock' if depleted
    tool.releasedAt = new Date();
    await tool.save();

    res.status(200).json({
      message: `Tool '${name}' requested successfully. ${tool.quantity} ${tool.unit} remaining.`,
      data: {
        name: tool.name,
        quantity: tool.quantity,
        unit: tool.unit,
        status: tool.status,
        releasedAt: tool.releasedAt,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to request tool",
      error: err.message,
    });
  }
});

// Painter Retrieves Released Tools
router.get("/released-tools", async (req, res) => {
  try {
    const releasedTools = await Tool.find({ status: "Released" });

    res.status(200).json({
      message: "Released tools fetched successfully",
      data: releasedTools,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch released tools",
      error: err.message,
    });
  }
});

// Painter Returns Tools
router.post("/return-tools", async (req, res) => {
  try {
    const { name, quantity, unit } = req.body;

    // Validate input
    if (!name || !quantity || quantity <= 0 || !unit) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    // Find the tool
    const tool = await Tool.findOne({ name });
    if (!tool) {
      return res.status(404).json({ message: "Tool not found" });
    }

    // Validate the unit
    if (tool.unit !== unit) {
      return res.status(400).json({
        message: `Invalid unit. Expected: ${tool.unit}, but got: ${unit}`,
      });
    }

    // Update quantity and status
    tool.quantity += quantity;
    tool.status = "Returned";
    tool.returnedAt = new Date();
    await tool.save();

    res.status(200).json({
      message: `Tool '${name}' returned successfully. ${tool.quantity} ${tool.unit} now available.`,
      data: {
        name: tool.name,
        quantity: tool.quantity,
        unit: tool.unit,
        status: tool.status,
        returnedAt: tool.returnedAt,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to return tool",
      error: err.message,
    });
  }
});

module.exports = router;
