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
    enum: [
      "Requested",
      "Approved",
      "Rejected",
      "Pending",
      "Supplied",
      "Accepted",
      "Supply Rejected",
    ],
    default: "Requested",
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
    default: Date.now,
  },
  supplyStatus: {
    type: String,
    enum: ["Not Supplied", "Pending Acceptance", "Accepted", "Rejected"],
    default: "Not Supplied",
  },
  suppliedDate: {
    type: Date,
  },
  acceptanceDate: {
    type: Date,
  },
  remarks: {
    type: String,
  },
  cost: {
    // ✅ Add this field
    type: Number,
    required: true, // Optional, set `true` if cost is always required
  },
});

const RequestedRawMaterials = mongoose.model(
  "RequestedRawMaterials",
  requestedRawMaterialsSchema
);

module.exports = RequestedRawMaterials;
