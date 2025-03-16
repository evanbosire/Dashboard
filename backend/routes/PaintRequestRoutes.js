const express = require("express");
const router = express.Router();
const PaintRequest = require("../models/PaintRequest");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

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

module.exports = router;
