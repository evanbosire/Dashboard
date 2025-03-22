const mongoose = require("mongoose");

const ToolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: {
      type: String,
      required: true,
      enum: [
        "pieces",
        "sheets",
        "units",
        "liters",
        "tubes",
        "pairs",
        "sets",
        "rolls",
      ],
    },
    status: {
      type: String,
      enum: ["Available", "Pending Release", "Released", "Returned"],
      default: "Available",
    },
    requestedQuantity: { type: Number, default: 0 },
    returnedQuantity: { type: Number, default: 0 },
    releasedAt: { type: Date },
    returnedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tool", ToolSchema);
