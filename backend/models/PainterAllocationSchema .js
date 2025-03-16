const mongoose = require("mongoose");

const PainterAllocationSchema = new mongoose.Schema({
  paintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PaintRequest",
    required: true,
  }, // Reference to the paint
  allocatedQuantity: { type: Number, required: true }, // Quantity allocated in liters
  allocatedAt: { type: Date, default: Date.now }, // Timestamp of allocation
});

module.exports = mongoose.model("PainterAllocation", PainterAllocationSchema);
