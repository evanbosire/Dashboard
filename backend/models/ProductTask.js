const mongoose = require("mongoose");

const ProductTaskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
    // ✅ Add these fields to track allocation
    allocatedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    allocatedAt: { type: Date },
    quantityAllocated: { type: Number, default: 0 },
  },

  { timestamps: true }
);

module.exports = mongoose.model("ProductTask", ProductTaskSchema);
