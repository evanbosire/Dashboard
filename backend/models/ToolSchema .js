const mongoose = require("mongoose");

const ToolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Name of the tool
    quantity: { type: Number, required: true }, // Quantity available
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
      enum: ["Available", "Released", "Returned"],
      default: "Available",
    }, // Status of the tool
    releasedAt: { type: Date }, // When the tool was released
    returnedAt: { type: Date }, // When the tool was returned
  },
  { timestamps: true } // Enables createdAt and updatedAt fields
);

module.exports = mongoose.model("Tool", ToolSchema);
