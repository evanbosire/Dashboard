const mongoose = require("mongoose");

// Create AllocatedMaterials Schema
const AllocatedMaterialsSchema = new mongoose.Schema({
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: "Requested" },
  allocatedQuantity: Number,
  allocatedToManufacturing: { type: Boolean, default: true },
});

const AllocatedMaterials = mongoose.model(
  "AllocatedMaterials",
  AllocatedMaterialsSchema
);

module.exports = AllocatedMaterials;
