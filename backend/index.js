const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config(); // Load environment variables from .env file

const customerRoutes = require("./routes/customerRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentsRoutes = require("./routes/paymentRoutes");
const shipmentsRoutes = require("./routes/shipmentsRoutes");
const suppliesRoute = require("./routes/suppliesRoute");
const requestedRoutes = require("./routes/requestedRoutes");
const servicesOfferedRoutes = require("./routes/servicesofferedRoutes");
const servicesPaymentRoutes = require("./routes/servicespaymentRoutes");
const productionRoutes = require("./routes/productionRoutes");
const messagesRoutes = require("./routes/messagesRoutes");
const adminRoutes = require("./routes/adminRoutes"); // Admin routes for login and registration

const app = express();
const port = process.env.PORT || 5000; // Use the environment PORT variable

// MongoDB connection using environment variable
const uri = process.env.MONGO_URL;
mongoose
  .connect(uri) // Consider updating options for Mongoose
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(bodyParser.json());

// Basic root route
app.get("/", (req, res) => {
  res.send("Welcome to the API!"); // Change this to your preferred response
});

// Use routes
app.use("/api/customers", customerRoutes);
app.use("/api", employeeRoutes);

app.use("/api", orderRoutes);
app.use("/api", paymentsRoutes);
app.use("/api", shipmentsRoutes);
app.use("/api", suppliesRoute);
app.use("/api", requestedRoutes);
app.use("/api", servicesOfferedRoutes);
app.use("/api", servicesPaymentRoutes);
app.use("/api", productionRoutes);
app.use("/api", messagesRoutes);
app.use("/api/admin", adminRoutes); // Admin routes for login and registration

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
