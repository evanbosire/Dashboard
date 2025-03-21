const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Service = require("../models/Service");
const Employee = require("../models/Employee");
const User = require("../models/User");
const Customer = require("../models/Customer");
const ServicesPayment = require("../models/ServicesPayment"); // Updated to use ServicesPayment
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// // Create a service request
// router.post("/service", async (req, res) => {
//   const { email, ironSheetType, color, gauge, location, description, price } =
//     req.body;
//   const customer = await Customer.findOne({
//     email: email.trim().toLowerCase(),
//   });

//   if (!customer) {
//     console.log("Customer not found!"); // Debugging
//     return res.status(404).json({ message: "Customer not found" });
//   }

//   if (customer.status !== "active") {
//     return res.status(403).json({ message: "Customer account is not active" });
//   }

//   console.log("Customer found:", customer); // Debugging

//   const service = new Service({
//     userId: customer._id, // Reference Customer ID
//     ironSheetType,
//     color,
//     gauge,
//     location,
//     description,
//     price,
//   });

//   await service.save();
//   res.status(201).json(service);
// });
// Create a service request
router.post("/service", async (req, res) => {
  const {
    customerName,
    phone,
    email,
    ironSheetType,
    color,
    gauge,
    location,
    description,
    numberOfSheets,
    pricePerSheet,
    totalPrice,
  } = req.body;

  const customer = await Customer.findOne({
    email: email.trim().toLowerCase(),
  });

  if (!customer) {
    
    return res.status(404).json({ message: "Customer not found" });
  }

  if (customer.status !== "active") {
    return res.status(403).json({ message: "Customer account is not active" });
  }

  const service = new Service({
    userId: customer._id, // Reference Customer ID
    customerName,
    phone,
    ironSheetType,
    color,
    gauge,
    location,
    description,
    numberOfSheets,
    pricePerSheet,
    totalPrice,
  });

  await service.save();
  res.status(201).json(service);
});


// Customer views their services
router.get("/customer/services", async (req, res) => {
  const { email } = req.query;
  const customer = await Customer.findOne({ email });
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }
  const services = await Service.find({ userId: customer._id });
  res.send(services);
});

// Function to validate payment code format
const isValidPaymentCode = (code) => {
  const regex = /^[A-Z1-9]{10}$/; // 10 uppercase characters (A-Z, 1-9), no zeros
  return regex.test(code);
};

router.post("/payment/:serviceId", async (req, res) => {
  try {
    const { serviceId } = req.params; // Get serviceId from URL
    const { amount, paymentCode, paymentMethod } = req.body;
    // Validate required fields (except serviceId, since it's in the URL)
    if (!amount || !paymentCode || !paymentMethod) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the selected service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      console.log("Service not found for ID:", serviceId);
      return res.status(404).json({ message: "Service not found" });
    }

    // Validate payment code format
    console.log("Validating payment code:", paymentCode);
    if (!isValidPaymentCode(paymentCode)) {
      console.log("Invalid payment code:", paymentCode);
      return res.status(400).json({
        message:
          "Invalid payment code format. Must be 10 uppercase characters (A-Z, 1-9) without zeros.",
      });
    }

    // Check if payment code is unique
    const existingPayment = await ServicesPayment.findOne({
      PaymentCode: paymentCode,
    });
    if (existingPayment) {
      console.log("Payment code already used:", paymentCode);
      return res.status(400).json({ message: "Payment code already used" });
    }

    // Ensure payment method is valid
    const validPaymentMethods = ["Mpesa", "Bank", "Cash"]; // Match the enum values in the schema
    if (!validPaymentMethods.includes(paymentMethod)) {
      console.log("Invalid payment method:", paymentMethod);
      return res.status(400).json({ message: "Invalid payment method" });
    }

    // Save the payment
    const payment = new ServicesPayment({
      serviceId,
      amount,
      PaymentCode: paymentCode,
      PaymentMethod: paymentMethod, // Ensure this matches the enum value
      PaymentStatus: "Paid",
      DatePaid: new Date(),
    });

    await payment.save();

    // Update service payment status
    await Service.findByIdAndUpdate(serviceId, {
      paymentStatus: "Paid",
      paymentCode: paymentCode,
      paymentMethod: paymentMethod,
    });

    console.log("Payment successful:", payment);
    res.status(201).json({ message: "Payment successful", payment });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// router.get("/customer/receipt/:serviceId", async (req, res) => {

//   try {
//     const { serviceId } = req.params;

//     // Fetch the service payment details
//     const service = await Service.findById(serviceId);

//     if (!service) {
//       return res.status(404).json({ message: "Service not found" });
//     }

//     // Check if the service payment is approved
//     if (service.status !== "Approved") {
//       return res
//         .status(400)
//         .json({ message: "Service payment is not approved yet" });
//     }

//     // Define the receipts folder
//     const receiptsFolder = path.join(__dirname, "..", "receipts");
//     if (!fs.existsSync(receiptsFolder)) {
//       fs.mkdirSync(receiptsFolder, { recursive: true });
//     }

//     // Set receipt file name
//     const receiptFileName = `receipt_${serviceId}.pdf`;
//     const receiptPath = path.join(receiptsFolder, receiptFileName);

//     // Create PDF document
//     const doc = new PDFDocument();
//     const stream = fs.createWriteStream(receiptPath);
//     doc.pipe(stream);

//     // Add company name
//     doc.fontSize(20).text("Corrugated Sheets Limited", { align: "center" });
//     doc.moveDown(1);

//     // Add service details
//     doc.fontSize(14).text(`Receipt for Service Payment`);
//     doc.moveDown(0.5);
//     doc.fontSize(12).text(`Service ID: ${service._id}`);
//     doc.text(`Iron Sheet Type: ${service.ironSheetType || "Unknown"}`);
//     doc.text(`Color: ${service.color || "N/A"}`);
//     doc.text(`Gauge: ${service.gauge || "N/A"}`);
//     doc.text(`Location: ${service.location || "N/A"}`);
//     doc.text(`Description: ${service.description || "N/A"}`);
//     doc.text(`Price: KES ${service.price || "0"}`);
//     doc.text(`Payment Status: ${service.paymentStatus || "N/A"}`);
//     doc.moveDown(0.5);

//     // Add payment details
//     doc.text(`Amount Paid: KES ${service.price}`);
//     doc.text(`Payment Code: ${service.paymentCode || "N/A"}`);
//     doc.text(`Payment Method: ${service.paymentMethod || "N/A"}`);
//     doc.text(`Payment Status: ${service.paymentStatus || "N/A"}`);
//     doc.text(`Date Paid: ${new Date(service.createdAt).toLocaleString()}`);
//     doc.moveDown(1);

//     // Add footer
//     doc.fontSize(10).text("Thank you for your payment!", { align: "center" });

//     // Finalize the document
//     doc.end();

//     // Wait for PDF to finish writing
//     stream.on("finish", () => {
//       res.download(receiptPath, receiptFileName, (err) => {
//         if (err) {
//           console.error("Error sending file:", err);
//           return res.status(500).json({ message: "Error generating receipt" });
//         }

//         // Optional: Delete file after download
//         setTimeout(() => {
//           if (fs.existsSync(receiptPath)) {
//             fs.unlinkSync(receiptPath);
//           }
//         }, 10000);
//       });
//     });
//   } catch (error) {
//     console.error("Error generating receipt:", error);
//     res.status(500).json({ message: "Error generating receipt", error });
//   }
// });

//  Customer to download the service receipt
router.get("/customer/receipt/:serviceId", async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Fetch the service payment details
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Check if the service payment is approved
    if (service.status !== "Approved") {
      return res
        .status(400)
        .json({ message: "Service payment is not approved yet" });
    }

    // Define the receipts folder
    const receiptsFolder = path.join(__dirname, "..", "receipts");
    if (!fs.existsSync(receiptsFolder)) {
      fs.mkdirSync(receiptsFolder, { recursive: true });
    }

    // Set receipt file name
    const receiptFileName = `receipt_${serviceId}.pdf`;
    const receiptPath = path.join(receiptsFolder, receiptFileName);

    // Create PDF document
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(receiptPath);
    doc.pipe(stream);

    // Add company name
    doc.fontSize(20).text("Corrugated Sheets Limited", { align: "center" });
    doc.moveDown(1);

    // Add service details
    doc.fontSize(14).text(`Receipt for Service Payment`);
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Service ID: ${service._id}`);
    doc.text(`Iron Sheet Type: ${service.ironSheetType || "Unknown"}`);
    doc.text(`Color: ${service.color || "N/A"}`);
    doc.text(`Gauge: ${service.gauge || "N/A"}`);
    doc.text(`Location: ${service.location || "N/A"}`);
    doc.text(`Description: ${service.description || "N/A"}`);

    // Add numberOfSheets, pricePerSheet, and totalPrice
    doc.text(`Number of Sheets: ${service.numberOfSheets || "N/A"}`);
    doc.text(`Price Per Sheet: KES ${service.pricePerSheet || "0"}`);
    doc.text(`Total Price: KES ${service.totalPrice || "0"}`);
    doc.text(`Payment Status: ${service.paymentStatus || "N/A"}`);
    doc.moveDown(0.5);

    // Add payment details
    doc.text(`Amount Paid: KES ${service.price}`);
    doc.text(`Payment Code: ${service.paymentCode || "N/A"}`);
    doc.text(`Payment Method: ${service.paymentMethod || "N/A"}`);
    doc.text(`Payment Status: ${service.paymentStatus || "N/A"}`);
    doc.text(`Date Paid: ${new Date(service.createdAt).toLocaleString()}`);
    doc.moveDown(1);

    // Add footer
    doc.fontSize(10).text("Thank you for your payment!", { align: "center" });

    // Finalize the document
    doc.end();

    // Wait for PDF to finish writing
    stream.on("finish", () => {
      res.download(receiptPath, receiptFileName, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          return res.status(500).json({ message: "Error generating receipt" });
        }

        // Optional: Delete file after download
        setTimeout(() => {
          if (fs.existsSync(receiptPath)) {
            fs.unlinkSync(receiptPath);
          }
        }, 10000);
      });
    });
  } catch (error) {
    console.error("Error generating receipt:", error);
    res.status(500).json({ message: "Error generating receipt", error });
  }
});
// Finance manager views all paid services
router.get("/finance/services", async (req, res) => {
  try {
    const services = await Service.find({ paymentStatus: "Paid" })
      .select("-userId") // Exclude userId
      .sort({ createdAt: -1 }); // Sort by newest first

    if (!services.length) {
      return res.status(404).json({ message: "No paid services found" });
    }

    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Finance manager approves a service
router.put("/finance/approve/:id", async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      {
        status: "Approved",
        // updatedAt will be automatically updated by Mongoose
      },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Service manager views all approved services
router.get("/serviceManager/services", async (req, res) => {
  const services = await Service.find({ status: "Approved" }).select("-userId");
  res.send(services);
});

// Service manager allocates a service to a supervisor
router.put("/serviceManager/allocate/:id", async (req, res) => {
  try {
    // Find a supervisor by role (case-insensitive)
    const supervisor = await Employee.findOne({
      role: { $regex: /^Supervisor$/i },
    });

    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    // Check if the service exists
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Allocate service to the supervisor
    service.allocatedTo = supervisor._id;
    service.status = "Allocated";
    await service.save();

    res.json({ message: "Service allocated successfully", service });
  } catch (error) {
    console.error("Error allocating service:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// Supervisor views allocated services
router.get("/supervisor/services", async (req, res) => {
  try {
    // Find any supervisor by role
    const supervisor = await Employee.findOne({ role: "Supervisor" });

    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    // Fetch services allocated to the supervisor
    const services = await Service.find({
      allocatedTo: supervisor._id,
    }).populate("allocatedTo");

    if (!services.length) {
      return res.status(404).json({ message: "No allocated services found" });
    }

    res.json({
      message: "Allocated services retrieved successfully",
      services,
    });
  } catch (error) {
    console.error("Error fetching allocated services:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// Supervisor assigns service to a Painter
// router.put("/supervisor/allocate/:id", async (req, res) => {
//   try {
//     // Find a painter by role
//     const painter = await Employee.findOne({ role: "Painter" });

//     if (!painter) {
//       return res.status(404).json({ message: "Painter not found" });
//     }

//     // Check if the service exists
//     const service = await Service.findById(req.params.id);
//     if (!service) {
//       return res.status(404).json({ message: "Service not found" });
//     }

//     // Assign service to the painter
//     service.renderedBy = painter._id;
//     service.status = "Assigned";
//     await service.save();

//     res.json({ message: "Service assigned to painter successfully", service });
//   } catch (error) {
//     console.error("Error allocating service:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });
// Supervisor assigns service to a Painter
router.put("/supervisor/allocate/:id", async (req, res) => {
  try {
    const { painter } = req.body; // Get the selected painter's name from the request body

    // Check if the service exists
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Assign the selected painter's name and update the status
    service.renderedBy = painter; // Save the painter's name
    service.status = "Assigned"; // Update the status
    await service.save();

    res.json({ message: "Service assigned to painter successfully", service });
  } catch (error) {
    console.error("Error allocating service:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Painter views assigned services
router.get("/painter/services", async (req, res) => {
  try {
    // Find the painter by role
    const painter = await Employee.findOne({ role: "Painter" });

    if (!painter) {
      return res.status(404).json({ message: "Painter not found" });
    }

    // Get all services assigned to the painter
    const services = await Service.find({ renderedBy: painter._id }).populate(
      "userId"
    );

    res.json({ message: "Assigned services retrieved successfully", services });
  } catch (error) {
    console.error("Error fetching assigned services:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Painter marks service as rendered
router.put("/painter/complete/:id", async (req, res) => {
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    { status: "Rendered" },
    { new: true }
  );
  res.send(service);
});
// Supervisor views all services with status "Rendered"
router.get("/supervisor/rendered-services", async (req, res) => {
  try {
    // Find the supervisor by role
    const supervisor = await Employee.findOne({ role: "Supervisor" });

    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    // Get all services with status "Rendered"
    const services = await Service.find({ status: "Rendered" }).populate(
      "renderedBy"
    );

    res.json({ message: "Rendered services retrieved successfully", services });
  } catch (error) {
    console.error("Error fetching rendered services:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Supervisor confirms rendered service
router.put("/supervisor/confirm/:id", async (req, res) => {
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    { status: "Confirmed" },
    { new: true }
  );
  res.send(service);
});

// Service manager views confirmed services
router.get("/serviceManager/confirmedServices", async (req, res) => {
  const services = await Service.find({ status: "Confirmed" }).populate(
    "userId"
  );
  res.send(services);
});

// Service manager approves confirmed service
router.put("/serviceManager/approve/:id", async (req, res) => {
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    { status: "Completed" },
    { new: true }
  );
  res.send(service);
});
// Customer views all completed services
router.get("/customer/completed-services", async (req, res) => {
  try {
    // Get all services with status "Completed"
    const services = await Service.find({ status: "Completed" }).populate(
      "allocatedTo renderedBy"
    );

    if (!services.length) {
      return res.status(404).json({ message: "No completed services found" });
    }

    res.json({
      message: "Completed services retrieved successfully",
      services,
    });
  } catch (error) {
    console.error("Error fetching completed services:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Customer submits feedback for a completed service
router.put("/customer/feedback/:id", async (req, res) => {
  const { feedback } = req.body;
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    { feedback },
    { new: true }
  );
  res.send(service);
});
// Service Manager fetches all completed services with feedback
router.get("/serviceManager/completed-services", async (req, res) => {
  try {
    // Find all services with status "Completed" and having feedback
    const completedServices = await Service.find({
      status: "Completed",
      feedback: { $exists: true, $ne: "" }, // Ensures feedback exists and is not empty
    });

    if (completedServices.length === 0) {
      return res
        .status(404)
        .json({ message: "No completed services with feedback found" });
    }

    res.json(completedServices);
  } catch (error) {
    console.error("Error fetching completed services with feedback:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
router.get("/user", async (req, res) => {
  // Check if the email query parameter exists
  if (!req.query.email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Safely trim the email
  const email = req.query.email.trim();

  try {
    // Use case-insensitive search
    const customer = await Customer.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      customerName: customer.customerName,
      phone: customer.phone,
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = router;
