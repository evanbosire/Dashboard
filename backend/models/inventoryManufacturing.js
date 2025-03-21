const mongoose = require("mongoose");

// Define Mongoose Schemas
const ProductSchema = new mongoose.Schema(
  {
    name: String, 
    description: String, 
    price: Number,
    quantity: Number,
   },
  { timestamps: true } 
);

const ManufacturingRequestSchema = new mongoose.Schema(
  {
    productName: String, 
    units: String, 
    quantity: Number, 
    description: String, 
    status: {
      type: String,
      enum: ["Pending", "Allocated", "Completed", "Approved", "Rejected"],
      default: "Pending",
    }, 
    allocatedTo: { type: String, default: null }, 
  },
  { timestamps: true } 
);

// Mongoose Models
const Product = mongoose.model("Product", ProductSchema);
const ManufacturingRequest = mongoose.model(
  "ManufacturingRequest",
  ManufacturingRequestSchema
);

// Export models
module.exports = { Product, ManufacturingRequest };
