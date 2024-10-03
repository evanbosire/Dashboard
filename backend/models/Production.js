// models/Production.js
const mongoose = require("mongoose");

const productionSchema = new mongoose.Schema({
  product: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  dateManufactured: { type: Date, required: true },
});

module.exports = mongoose.model("Production", productionSchema);
