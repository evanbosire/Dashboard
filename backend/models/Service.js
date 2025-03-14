// models/Service.js
const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ironSheetType: String,
    color: String,
    gauge: String,
    location: String,
    description: String,
    price: Number,
    status: { type: String, default: "Pending" },
    paymentStatus: { type: String, default: "Unpaid" },
    paymentCode: { type: String },
    paymentMethod: { type: String },
    feedback: String,
    allocatedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    renderedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    serviceDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", ServiceSchema);
