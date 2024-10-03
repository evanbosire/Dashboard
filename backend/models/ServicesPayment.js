// models/ServicesPayment.js
const mongoose = require("mongoose");

const customerDetailsSchema = new mongoose.Schema({
  driverName: String,
  Email: String,
  Phone: String,
});

const servicesPaymentSchema = new mongoose.Schema({
  customerDetails: customerDetailsSchema,
  Location: String,
  ServiceName: String,
  BookingDate: String,
  ServicingDate: String,
  AmountPaid: String,
  PaymentDate: String,
  PaymentStatus: String,
});

module.exports = mongoose.model("ServicesPayment", servicesPaymentSchema);
