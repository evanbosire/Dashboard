// models/Requested.js
const mongoose = require("mongoose");

const requestedSchema = new mongoose.Schema({
  material: {
    type: String,
    required: true,
  },
  requestedQuantity: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Requested", "Released", "Returned"],
    required: true,
  },
  painter: {
    type: String,
    required: true,
  },
  dateRequested: {
    type: Date,
    required: true,
  },
});

const Requested = mongoose.model("Requested", requestedSchema);

module.exports = Requested;
