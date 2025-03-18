const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ironSheetType: { type: String, required: true },
    color: { type: String, required: true },
    gauge: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    numberOfSheets: { type: Number, required: true },
    pricePerSheet: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, default: "Pending" },
    paymentStatus: { type: String, default: "Unpaid" },
    paymentCode: { type: String },
    paymentMethod: { type: String },
    feedback: { type: String },
    allocatedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    renderedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    serviceDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", ServiceSchema);
