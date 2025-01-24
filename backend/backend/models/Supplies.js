// models/supply.js
const mongoose = require("mongoose");

const supplySchema = new mongoose.Schema({
  ProductName: { type: String, required: true },
  RequestedQty: { type: Number, required: true },
  SupplingPrice: { type: String, required: true },
  Supplier: { type: String, required: true },
  Status: { type: String, required: true },
  Date: { type: Date, required: true },
  RequestedOn: { type: Date, required: true },
  PaymentStatus: { type: String, required: true },
  TotalPrice: { type: String, required: true },
});

const Supply = mongoose.model("Supply", supplySchema);
module.exports = Supply;
