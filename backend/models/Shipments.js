// models/Shipments.js
const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  customerName: { type: String, required: true },
  productDetails: { type: String, required: true },
  AmountPaid: { type: String, required: true },
  DeliveryFee: { type: String, required: true },
  DatePaid: { type: Date, required: true },
  TransactionCode: { type: String, required: true },
  PaymentStatus: { type: String, required: true },
  LocationDetails: { type: String, required: true },
  ShippingStatus: { type: String, required: true },
  ShipperDetails: {
    driverName: { type: String, required: true },
    Email: { type: String, required: true },
    Phone: { type: String, required: true },
  },
  CustomerFeedback: { type: String },
});

module.exports = mongoose.model("Shipment", shipmentSchema);
