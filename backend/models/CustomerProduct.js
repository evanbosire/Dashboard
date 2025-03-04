const mongoose = require("mongoose");

const CustomerProductSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // Reference to the inventory product
  name: String,
  description: String,
  price: Number,
  quantity: Number, // Customer-side stock
});

const CustomerProduct = mongoose.model(
  "CustomerProduct",
  CustomerProductSchema
);

module.exports = CustomerProduct;
