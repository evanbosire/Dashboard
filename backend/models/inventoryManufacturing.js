const mongoose = require("mongoose");

// Define Mongoose Schemas
const ProductSchema = new mongoose.Schema({
  name: String, // Product name (e.g., Aluminium Zinc-Coated Sheets)
  description: String, // Product description
  quantity: Number, // Available stock quantity
});

const ManufacturingRequestSchema = new mongoose.Schema({
  productName: String, // Name of the product to be manufactured
  units: String, // Units of the product to manufacture
  quantity: Number, // Quantity of the product to manufacture
  description: String, // Additional description for the request
  status: {
    type: String,
    enum: ["Pending", "Allocated", "Completed", "Approved", "Rejected"],
    default: "Pending",
  }, // Status of the request
  allocatedTo: { type: String, default: null }, // Manufacturing team assigned to the task
});

// Mongoose Models
const Product = mongoose.model("Product", ProductSchema);
const ManufacturingRequest = mongoose.model(
  "ManufacturingRequest",
  ManufacturingRequestSchema
);

// Export models
module.exports = { Product, ManufacturingRequest };
