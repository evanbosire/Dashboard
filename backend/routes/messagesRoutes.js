// routes/messagesRoutes.js
const express = require("express");
const router = express.Router();
const Message = require("../models/Messages");

// // Get all messages
// router.get("/messages", async (req, res) => {
//   try {
//     const messages = await Message.find(); // Fetch all messages
//     res.json(messages); // Send the data as JSON
//   } catch (err) {
//     res.status(500).json({ message: err.message }); // Handle any errors
//   }
// });
// Send a Message
router.post("/api/messages", async (req, res) => {
  const { sender, receiver, message, customerName } = req.body;

  // Validate sender and receiver
  const validUsers = [
    "customer",
    "inventory manager",
    "finance manager",
    "driver",
    "dispatch manager",
    "production manager",
    "manufacturer",
    "service manager",
    "supervisor",
    "painter",
    "supplier",
  ];

  if (!validUsers.includes(sender) || !validUsers.includes(receiver)) {
    return res.status(400).json({ error: "Invalid sender or receiver" });
  }

  // Restrict supplier from messaging anyone except inventory manager and finance manager
  if (
    sender === "supplier" &&
    !["inventory manager", "finance manager"].includes(receiver)
  ) {
    return res
      .status(400)
      .json({
        error: "Supplier can only message inventory manager or finance manager",
      });
  }

  // Restrict customer from messaging supplier
  if (sender === "customer" && receiver === "supplier") {
    return res.status(400).json({ error: "Customer cannot message supplier" });
  }

  // Validate customerName for customer messages
  if (sender === "customer" && !customerName) {
    return res
      .status(400)
      .json({ error: "customerName is required for customer messages" });
  }

  try {
    const newMessage = new Message({
      sender,
      receiver,
      message,
      customerName: sender === "customer" ? customerName : null, // Only set customerName for customer messages
    });
    await newMessage.save();
    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Get Messages for a User
router.get("/api/messages/:user", async (req, res) => {
  const user = req.params.user;

  try {
    const messages = await Message.find({
      $or: [{ sender: user }, { receiver: user }],
    }).sort({ timestamp: 1 }); // Sort by timestamp
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});


module.exports = router;
