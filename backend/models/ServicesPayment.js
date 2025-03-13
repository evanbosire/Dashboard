const mongoose = require("mongoose");

const ServicesPaymentSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  amount: { type: Number, required: true },
  PaymentCode: { type: String, required: true, unique: true },
  PaymentMethod: {
    type: String,
    enum: ["Mpesa", "Bank", "Cash"], // Ensure Mpesa is included if valid
    required: true,
  },
  PaymentStatus: { type: String, default: "Pending" },
  DatePaid: { type: Date, default: Date.now }, // Automatically sets date
});

module.exports = mongoose.model("ServicesPayment", ServicesPaymentSchema);
