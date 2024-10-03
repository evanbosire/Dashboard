const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const customerRoutes = require("./routes/customerRoutes");
const employeeRouters = require("./routes/employeeRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentsRoutes = require("./routes/paymentRoutes");
const shipmentsRoutes = require("./routes/shipmentsRoutes");
const suppliesRoute = require("./routes/suppliesRoute");
const requestedRoutes = require("./routes/requestedRoutes");
const servicesOfferedRoutes = require("./routes/servicesofferedRoutes");
const servicesPaymentRoutes = require("./routes/servicespaymentRoutes");
const productionRoutes = require("./routes/productionRoutes");
const messagesRoutes = require("./routes/messagesRoutes");

const app = express();
const port = 5000;

// MongoDB connection
const uri =
  "mongodb+srv://Database_1:Database_1@cluster0.lybf6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(uri, { useNewUrlParser: false, useUnifiedTopology: false })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(bodyParser.json());

// Use customer routes
app.use("/api/customers", customerRoutes);
// Use employee routes
app.use("/api", employeeRouters);
// Use order routes
app.use("/api", orderRoutes); // Mount the routes under /api
// payment routes
app.use("/api", paymentsRoutes);
// Shipments Routes
app.use("/api", shipmentsRoutes);
// Supplies Routes
app.use("/api", suppliesRoute);
// Requested Routes

app.use("/api", requestedRoutes);
// Services Offered Routes
app.use("/api", servicesOfferedRoutes);
// Services Payment Routes
app.use("/api", servicesPaymentRoutes);
//  production routes
app.use("/api", productionRoutes);
// Messages routes
app.use("/api", messagesRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
