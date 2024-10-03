const mongoose = require("mongoose");

// Payment schema definition
const paymentSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  customerName: String,
  productDetails: String,
  DatePaid: { type: Date, required: true },
  TransactionCode: { type: String, required: true },
  AmountPaid: String,
  ShippingCost: String,
  PaymentStatus: { type: String, enum: ["Paid", "Unpaid"], required: true },
  PaymentMethod: { type: String, enum: ["M-Pesa"], required: true },
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = { Payment };
