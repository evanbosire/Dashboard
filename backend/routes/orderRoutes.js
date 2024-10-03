// src/routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// Get all orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
