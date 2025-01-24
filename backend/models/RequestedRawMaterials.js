// models/Requested.js
const mongoose = require("mongoose");

const requestedRawMaterialsSchema = new mongoose.Schema({
  material: {
    type: String,
    required: true,
  },
  requestedQuantity: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Requested", "Approved", "Rejected"], // Updated enum values
    default: "Requested", // Default status is "Requested"
  },
  supplier: {
    type: String,
    required: true,
  },
  deliveryDate: {
    type: Date,
    required: true,
  },
  dateRequested: {
    type: Date,
    default: Date.now, // Automatically set to the current date
  },
});

const RequestedRawMaterials = mongoose.model(
  "RequestedRawMaterials",
  requestedRawMaterialsSchema
);

module.exports = RequestedRawMaterials;
