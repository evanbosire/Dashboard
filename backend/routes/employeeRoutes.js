const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");

// Route to add a new employee
router.post("/employee", async (req, res) => {
  const { password } = req.body;

  if (password.length !== 4) {
    return res
      .status(400)
      .json({ message: "Password must be At least 4 characters" });
  }

  try {
    const employeeData = req.body;
    const newEmployee = new Employee(employeeData);
    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error("Error saving employee:", error);
    res.status(400).json({ message: error.message });
  }
});

// Fetch employees by status
router.get("/employees/:status", async (req, res) => {
  try {
    const employees = await Employee.find({ status: req.params.status });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route for inactivating an employee
router.patch("/employees/inactivate/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    employee.status = "inactive";
    await employee.save();
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Route for activating an employee
router.patch("/employees/activate/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await Employee.findById(id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    employee.status = "active";
    await employee.save();

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// route to log in an employee

// POST /api/employee/login
router.post("/employees/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const employee = await Employee.findOne({ email, role });
    if (!employee || employee.password !== password) {
      return res.status(400).json({ message: "Invalid credentials or role." });
    }

    // Check if employee is active (you could add more checks if needed)
    if (employee.status !== "active") {
      return res.status(403).json({ message: "Account not active." });
    }

    // Return employee details for successful login
    res.status(200).json({
      email: employee.email,
      role: employee.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error, please try again later." });
  }
});

module.exports = router;
