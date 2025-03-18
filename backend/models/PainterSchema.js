const mongoose = require("mongoose");

const PainterSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name of the painter
  contact: { type: String, required: true }, // Contact information
  toolsRequested: [
    {
      toolId: { type: mongoose.Schema.Types.ObjectId, ref: "Tool" }, // Tool requested
      quantity: { type: Number, required: true }, // Quantity requested
      status: {
        type: String,
        enum: ["Requested", "Released", "Returned"],
        default: "Requested",
      }, // Status of the request
    },
  ],
});

module.exports = mongoose.model("Painter", PainterSchema);
