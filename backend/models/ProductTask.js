const mongoose = require("mongoose");

const ProductTaskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductTask", ProductTaskSchema);
