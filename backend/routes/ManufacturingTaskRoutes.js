const express = require("express");
const router = express.Router();
const ManufacturingTask = require("../models/ManufacturingTask");
const Employee = require("../models/Employee");
const AllocatedMaterials = require("../models/AllocatedMaterials ");
const multer = require("multer");
const path = require("path");
const ProductTask = require("../models/ProductTask");

// Assign a task to the manufacturing team
router.post("/assign-task", async (req, res) => {
  const { taskName, description } = req.body;

  try {
    // Fetch an available Manufacturer
    const manufacturingTeamMember = await Employee.findOne({
      role: "Manufacturer",
    });
    if (!manufacturingTeamMember) {
      return res
        .status(400)
        .json({ message: "No available manufacturing team member found" });
    }

    // Fetch an available Production Manager
    const productionManager = await Employee.findOne({
      role: "Production manager",
    });
    if (!productionManager) {
      return res
        .status(400)
        .json({ message: "No available production manager found" });
    }

    // Fetch allocated materials for manufacturing
    const allocatedMaterials = await AllocatedMaterials.find({
      allocatedToManufacturing: true,
    });

    if (!allocatedMaterials.length) {
      return res
        .status(400)
        .json({ message: "No allocated materials found for manufacturing." });
    }

    // Create the task
    const task = new ManufacturingTask({
      taskName,
      description,
      assignedTo: manufacturingTeamMember._id,
      assignedBy: productionManager._id,
      allocatedMaterials: allocatedMaterials.map((mat) => ({
        materialId: mat.materialId,
        quantity: mat.allocatedQuantity,
      })),
    });

    await task.save();

    res.status(201).json({ message: "Task assigned successfully", task });
  } catch (err) {
    console.error("Error assigning task:", err);
    res.status(500).json({ error: err.message });
  }
});

// Fetch tasks assigned to the manufacturing team
router.get("/assigned-tasks", async (req, res) => {
  try {
    // Find the manufacturing team members
    const manufacturingTeam = await Employee.find({ role: "Manufacturer" });

    if (!manufacturingTeam || manufacturingTeam.length === 0) {
      return res
        .status(404)
        .json({ message: "No manufacturing team members found" });
    }

    // Get the IDs of all manufacturing team members
    const manufacturerIds = manufacturingTeam.map((member) => member._id);

    // Find tasks assigned to any manufacturing team member
    const tasks = await ManufacturingTask.find({
      assignedTo: { $in: manufacturerIds }, // Find tasks assigned to any manufacturer
      status: { $in: ["Assigned", "In Progress"] },
    }).populate("allocatedMaterials.materialId");

    res.status(200).json({
      message: "Tasks fetched successfully",
      tasks,
    });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: err.message });
  }
});

// Mark task as completed by the Manufacturing Team
router.put("/complete-task/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const { remarks } = req.body;

  try {
    // Find the task
    const task = await ManufacturingTask.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Ensure task is assigned to a manufacturer
    const assignedEmployee = await Employee.findById(task.assignedTo);
    if (!assignedEmployee || assignedEmployee.role !== "Manufacturer") {
      return res
        .status(403)
        .json({ message: "Only Manufacturers can complete tasks" });
    }

    // Mark task as completed
    task.status = "Completed";
    task.completedAt = Date.now();
    task.remarks = remarks;

    await task.save();

    res.status(200).json({
      message: "Task marked as completed",
      task,
    });
  } catch (err) {
    console.error("Error completing task:", err);
    res.status(500).json({ error: err.message });
  }
});
// get completed tasks and display the number in the manufacturing dashboard
router.get("/completed-tasks", async (req, res) => {
  try {
    // Fetch tasks that have a status of "Completed"
    const completedTasks = await ManufacturingTask.find({
      status: "Completed",
    });

    res.status(200).json({
      message: "Completed tasks retrieved successfully",
      tasks: completedTasks,
    });
  } catch (err) {
    console.error("Error fetching completed tasks:", err);
    res.status(500).json({ error: err.message });
  }
});

// Confirm or reject manufactured products (Production Manager)
router.put("/confirm-task/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const { status, remarks } = req.body;

  try {
    // Find the task
    const task = await ManufacturingTask.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Ensure valid status input
    if (!["Confirmed", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Update task status
    task.status = status;
    task.confirmedAt = status === "Confirmed" ? Date.now() : null;
    task.remarks = remarks;

    await task.save();

    res.status(200).json({
      message: `Task ${status.toLowerCase()} successfully`,
      task,
    });
  } catch (err) {
    console.error("Error confirming task:", err);
    res.status(500).json({ error: err.message });
  }
});
// Fetch confirmed manufacturing tasks
router.get("/confirmed-tasks", async (req, res) => {
  try {
    // Fetch tasks with status "Confirmed"
    const confirmedTasks = await ManufacturingTask.find({
      status: "Confirmed",
    }).populate("allocatedMaterials.materialId"); // Populate material details if needed

    res.status(200).json({
      message: "Confirmed tasks retrieved successfully",
      tasks: confirmedTasks,
    });
  } catch (err) {
    console.error("Error fetching confirmed tasks:", err);
    res.status(500).json({ error: err.message });
  }
});
// Multer Storage Setup
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// POST: Add a new manufacturing task by manufacturing team
router.post("/products", upload.single("image"), async (req, res) => {
  try {
    const { name, quantity } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!name || !quantity || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newTask = new ProductTask({ name, quantity, image });
    await newTask.save();

    res
      .status(201)
      .json({ message: "Product added successfully", task: newTask });
  } catch (error) {
    res.status(500).json({ message: "Error adding product", error });
  }
});

// GET: Fetch all manufacturing tasks
router.get("/products-manufactured", async (req, res) => {
  try {
    const tasks = await ProductTask.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
});
// ✅ PUT: Auto-allocate a product to an Inventory Manager (with stock validation)
router.put("/products/:id/allocate", async (req, res) => {
  try {
    const { quantityToAllocate } = req.body; // Get quantity from request body
    const productId = req.params.id;

    // 🔍 Find an employee with the role of "Inventory Manager"
    const inventoryManager = await Employee.findOne({
      role: "Inventory manager",
    });

    if (!inventoryManager) {
      return res.status(404).json({ message: "No Inventory Manager found" });
    }

    // 🔍 Find the product
    const product = await ProductTask.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 🚫 Prevent zero or negative allocation
    if (!quantityToAllocate || quantityToAllocate <= 0) {
      return res
        .status(400)
        .json({ message: "Allocation quantity must be greater than zero" });
    }

    // 🚫 Prevent over-allocation (more than available stock)
    if (quantityToAllocate > product.quantity) {
      return res
        .status(400)
        .json({ message: "Not enough stock available for allocation" });
    }

    // ✅ Reduce available stock and assign product to Inventory Manager
    product.quantity -= quantityToAllocate;
    product.allocatedTo = inventoryManager._id;
    await product.save();

    res.status(200).json({
      message: `Allocated ${quantityToAllocate} units of ${product.name} to Inventory Manager successfully`,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: "Error allocating product", error });
  }
});
// ✅ GET: Fetch all allocated products for an Inventory Manager (without manual ID)
router.get("/products/allocated", async (req, res) => {
  try {
    // 🔍 Find the Inventory Manager automatically
    const inventoryManager = await Employee.findOne({
      role: "Inventory manager",
    });

    if (!inventoryManager) {
      return res.status(404).json({ message: "No Inventory Manager found" });
    }

    // 🔍 Find all products allocated to this Inventory Manager
    const allocatedProducts = await ProductTask.find({
      allocatedTo: inventoryManager._id,
    }).select("name quantity image allocatedAt");

    if (!allocatedProducts.length) {
      return res.status(404).json({ message: "No products allocated yet" });
    }

    res.status(200).json({
      message: "Allocated products retrieved successfully",
      allocatedProducts,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching allocated products", error });
  }
});

module.exports = router;
