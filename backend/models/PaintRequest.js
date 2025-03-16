const mongoose = require("mongoose");

const PaintRequestSchema = new mongoose.Schema({
  color: { type: String, required: true },
  quantity: { type: Number, required: true },
  description: { type: String, required: true },
  deliveryDate: { type: Date, required: true },
  supplier: { type: String, required: true },
  status: {
    type: String,
    enum: [
      "Pending",
      "Approved",
      "Rejected",
      "Supplied",
      "Received",
    ],
    default: "Pending",
  },
  pricePerUnit: { type: Number },
  totalPrice: { type: Number },
  paymentStatus: { type: String, enum: ["Unpaid", "Paid"], default: "Unpaid" },
  paymentCode: { type: String },
});

module.exports = mongoose.model("PaintRequest", PaintRequestSchema);
