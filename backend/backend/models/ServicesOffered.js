// models/ServicesOffered.js
const mongoose = require("mongoose");

const servicesOfferedSchema = new mongoose.Schema({
  customerDetails: {
    driverName: { type: String, required: true },
    Email: { type: String, required: true },
    Phone: { type: String, required: true },
  },
  Location: { type: String, required: true },
  ServiceName: { type: String, required: true },
  BookingDate: { type: Date, required: true },
  ServicingDate: { type: Date, required: true },
  BookingFee: { type: String, required: true },
  ServiceFee: { type: String, required: true },
  PaymentDate: { type: Date, required: true },
  PaymentStatus: { type: String, required: true },
  BookingStatus: { type: String, required: true },
  AllocatedPainters: [String],
});

module.exports = mongoose.model("ServicesOffered", servicesOfferedSchema);
