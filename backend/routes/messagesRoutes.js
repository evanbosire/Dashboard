// routes/messagesRoutes.js
const express = require("express");
const router = express.Router();
const Message = require("../models/Messages");

// Get all messages
router.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find(); // Fetch all messages
    res.json(messages); // Send the data as JSON
  } catch (err) {
    res.status(500).json({ message: err.message }); // Handle any errors
  }
});

module.exports = router;
