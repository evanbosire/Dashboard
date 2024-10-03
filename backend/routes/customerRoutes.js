const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");

// Fetch customers by status
router.get("/:status", async (req, res) => {
  try {
    const customers = await Customer.find({ status: req.params.status });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve a customer
router.patch("/approve/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    customer.status = "active"; // Update status to active
    await customer.save();

    res.status(200).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Suspend a customer
router.patch("/suspend/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByIdAndUpdate(
      id,
      { status: "suspended" },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reactivate customer endpoint
router.patch("/reactivate/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Reactivation logic here
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    customer.status = "active"; // Example logic
    await customer.save();

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
// Example route for rejecting a customer
router.patch("/reject/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    customer.status = "rejected"; // Adjust status according to your implementation
    await customer.save();
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/revert/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await Customer.findById(id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    customer.status = "pending"; // Set status to pending
    await customer.save();

    res.status(200).json(customer); // Return the updated customer
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to get count of pending customers
router.get("/counts/pending", async (req, res) => {
  try {
    const count = await Customer.countDocuments({ status: "pending" });
    res.json({ pending: count });
  } catch (error) {
    console.error("Error fetching pending customer count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to get count of active customers
router.get("/counts/active", async (req, res) => {
  try {
    const count = await Customer.countDocuments({ status: "active" });
    res.json({ active: count });
  } catch (error) {
    console.error("Error fetching active customer count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to get count of suspended customers
router.get("/counts/suspended", async (req, res) => {
  try {
    const count = await Customer.countDocuments({ status: "suspended" });
    res.json({ suspended: count });
  } catch (error) {
    console.error("Error fetching suspended customer count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to get count of rejected customers
router.get("/counts/rejected", async (req, res) => {
  try {
    const count = await Customer.countDocuments({ status: "rejected" });
    res.json({ rejected: count });
  } catch (error) {
    console.error("Error fetching rejected customer count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// To update the admin UI whenever a change is made, i will use SSE Endpoint.

// SSE endpoint
let clients = [];

const sendUpdateEvent = async () => {
  const data = {
    pending: await Customer.countDocuments({ status: "pending" }),
    active: await Customer.countDocuments({ status: "active" }),
    suspended: await Customer.countDocuments({ status: "suspended" }),
    rejected: await Customer.countDocuments({ status: "rejected" }),
  };

  clients.forEach((client) =>
    client.res.write(`data: ${JSON.stringify(data)}\n\n`)
  );
};

router.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  clients.push({ res });

  req.on("close", () => {
    clients = clients.filter((client) => client.res !== res);
  });
});

// Login endpoint with status check
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find customer by email
    const customer = await Customer.findOne({ email });

    // Check if customer exists
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Check if customer status is 'active'
    if (customer.status !== "active") {
      return res
        .status(403)
        .json({ message: "Account not approved or inactive" });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, customer.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: customer._id, email: customer.email },
      "your_jwt_secret_key", // Use your secret key
      { expiresIn: "1h" } // Set token expiration
    );

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
