const mongoose = require("mongoose");

const manufacturingTaskSchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee", // Reference to the manufacturing team member
    required: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee", // Reference to the Production Manager
    required: true,
  },
  allocatedMaterials: [
    {
      materialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RequestedRawMaterials", // Reference to the allocated raw materials
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  status: {
    type: String,
    enum: ["Assigned", "In Progress", "Completed", "Rejected", "Confirmed"],
    default: "Assigned",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  confirmedAt: {
    type: Date,
  },
  remarks: {
    type: String,
  },
});

const ManufacturingTask = mongoose.model(
  "ManufacturingTask",
  manufacturingTaskSchema
);

module.exports = ManufacturingTask;
