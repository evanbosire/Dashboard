const express = require("express");
const router = express.Router();
const {
  Product,
  ManufacturingRequest,
} = require("../models/inventoryManufacturing"); // Import models
const CustomerProduct = require("../models/CustomerProduct");
const Order = require("../models/Order");

/**
 * @route POST /api/request-manufacturing
 * @description Create a new manufacturing request by the inventory manager.
 * @body {productName, units, quantity, description}
 */
router.post("/request-manufacturing", async (req, res) => {
  const { productName, units, quantity, description } = req.body;

  try {
    const request = new ManufacturingRequest({
      productName,
      units,
      quantity,
      description,
    });
    await request.save();
    res.status(201).json({ message: "Manufacturing request created", request });
  } catch (error) {
    res.status(500).json({ message: "Error creating request", error });
  }
});

/**
 * @route GET /api/manufacturing-requests
 * @description Fetch all manufacturing requests for the production manager to review.
 */
router.get("/manufacturing-requests", async (req, res) => {
  try {
    const requests = await ManufacturingRequest.find({});
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests", error });
  }
});

/**
 * @route PUT /api/allocate-task/:requestId
 * @description Allocate a manufacturing task to the manufacturing team.
 * @param {requestId} - ID of the manufacturing request to allocate.
 * @body {allocatedTo} - Name or ID of the manufacturing team.
 */
router.put("/allocate-task/:requestId", async (req, res) => {
  const { requestId } = req.params;
  const { allocatedTo } = req.body;

  try {
    const request = await ManufacturingRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "Allocated";
    request.allocatedTo = allocatedTo;
    await request.save();
    res.json({ message: "Task allocated to manufacturing team", request });
  } catch (error) {
    res.status(500).json({ message: "Error allocating task", error });
  }
});

/**
 * @route GET /api/manufacturing-tasks
 * @description Fetch all tasks allocated to the manufacturing team.
 */
router.get("/manufacturing-tasks", async (req, res) => {
  try {
    const tasks = await ManufacturingRequest.find({ status: "Allocated" });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error });
  }
});

/**
 * @route PUT /api/complete-task/:requestId
 * @description Mark a manufacturing task as completed by the manufacturing team.
 * @param {requestId} - ID of the manufacturing request to complete.
 */
router.put("/complete-task/:requestId", async (req, res) => {
  const { requestId } = req.params;

  try {
    const request = await ManufacturingRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "Completed";
    await request.save();
    res.json({ message: "Task marked as completed", request });
  } catch (error) {
    res.status(500).json({ message: "Error completing task", error });
  }
});
// get completed tasks by the production from manufacturing team
router.get("/completed-tasks", async (req, res) => {
  try {
    const tasks = await ManufacturingRequest.find({ status: "Completed" });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error });
  }
});

/**
 * @route PUT /api/approve-task/:requestId
 * @description Approve a completed task by the production manager and update inventory stock.
 * @param {requestId} - ID of the manufacturing request to approve.
 */
router.put("/approve-task/:requestId", async (req, res) => {
  const { requestId } = req.params;

  try {
    const request = await ManufacturingRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Check if the product already exists in the inventory
    let product = await Product.findOne({ name: request.productName });

    if (!product) {
      // If the product doesn't exist, create a new entry in the inventory
      product = new Product({
        name: request.productName,
        description: request.description,
        quantity: request.quantity,
      });
    } else {
      // If the product exists, update its quantity
      product.quantity += request.quantity;
    }

    await product.save();

    // Update request status
    request.status = "Approved";
    await request.save();

    res.json({ message: "Task approved and stock updated", request });
  } catch (error) {
    res.status(500).json({ message: "Error approving task", error });
  }
});

/**
 * @route PUT /api/reject-task/:requestId
 * @description Reject a completed task by the production manager and send it back to manufacturing.
 * @param {requestId} - ID of the manufacturing request to reject.
 */
router.put("/reject-task/:requestId", async (req, res) => {
  const { requestId } = req.params;

  try {
    const request = await ManufacturingRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Update request status
    request.status = "Rejected";
    await request.save();

    res.json({
      message: "Task rejected and sent back to manufacturing",
      request,
    });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting task", error });
  }
});

/**
 * @route GET /api/rejected-tasks
 * @description Fetch all rejected tasks for the manufacturing team to rework.
 */
router.get("/rejected-tasks", async (req, res) => {
  try {
    const tasks = await ManufacturingRequest.find({ status: "Rejected" });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rejected tasks", error });
  }
});

/**
 * @route GET /api/inventory-stock
 * @description Fetch current inventory stock for the inventory manager.
 */
router.get("/inventory-stock", async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching inventory stock", error });
  }
});
/**
 * @route POST /api/post-product/:productId
 * @description Move a product from inventory to the customer side, updating stock and price.
 */
router.post("/post-product/:productId", async (req, res) => {
  const { productId } = req.params;
  const { description, price, quantityToPost } = req.body;

  try {
    // Validate input data
    if (!quantityToPost || quantityToPost <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be greater than zero" });
    }
    if (!price || price <= 0) {
      return res
        .status(400)
        .json({ message: "Price must be greater than zero" });
    }

    // Find the product in inventory
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found in inventory" });
    }

    // Ensure enough stock is available
    if (quantityToPost > product.quantity) {
      return res
        .status(400)
        .json({ message: "Insufficient quantity in stock" });
    }

    // Decrement inventory stock
    product.quantity -= quantityToPost;
    await product.save();

    // Check if product exists in customer side
    let customerProduct = await CustomerProduct.findOne({ productId });

    if (customerProduct) {
      // If product exists, update stock and price
      customerProduct.quantity += quantityToPost;
      customerProduct.price = price;
      customerProduct.description = description;
    } else {
      // If not, create a new customer-side product entry
      customerProduct = new CustomerProduct({
        productId: product._id,
        name: product.name,
        description,
        price,
        quantity: quantityToPost,
      });
    }

    await customerProduct.save();

    res.status(200).json({
      message: "Product posted to customer side successfully",
      inventory: product,
      customerStock: customerProduct,
    });
  } catch (error) {
    console.error("Error posting product to customer side:", error);
    res
      .status(500)
      .json({ message: "Error posting product to customer side", error });
  }
});
// API to get posted products for the customer side
router.get("/posted-products", async (req, res) => {
  try {
    // Retrieve all posted products (customer-side products)
    const postedProducts = await CustomerProduct.find();

    if (!postedProducts || postedProducts.length === 0) {
      return res.status(404).json({ message: "No posted products found" });
    }

    res.status(200).json({
      message: "Posted products retrieved successfully",
      postedProducts,
    });
  } catch (error) {
    console.error("Error retrieving posted products:", error);
    res
      .status(500)
      .json({ message: "Error retrieving posted products", error });
  }
});
// // Checkout route
// router.post("/checkout", async (req, res) => {
//   try {
//     const { cartItems, paymentCode, phoneNumber, email, county, description } =
//       req.body;

//     // Validate cart items
//     if (!cartItems || cartItems.length === 0) {
//       return res.status(400).json({ message: "Cart is empty" });
//     }

//     // Check if the requested quantity is available for each product
//     for (const item of cartItems) {
//       const product = await CustomerProduct.findById(item.productId);
//       if (!product) {
//         return res
//           .status(404)
//           .json({ message: `Product ${item.productId} not found` });
//       }

//       if (product.quantity < item.quantity) {
//         return res.status(400).json({
//           message: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`,
//         });
//       }
//     }

//     // Subtract the quantity from the available stock
//     for (const item of cartItems) {
//       const product = await CustomerProduct.findById(item.productId);
//       product.quantity -= item.quantity; // Subtract the quantity
//       await product.save(); // Save the updated product
//     }

//     // Calculate total price
//     const totalPrice = cartItems.reduce(
//       (total, item) => total + item.price * item.quantity,
//       0
//     );

//     // Create a new order
//     const order = new Order({
//       products: cartItems.map((item) => ({
//         product: item.productId, // Reference to the CustomerProduct
//         quantity: item.quantity,
//       })),
//       totalPrice,
//       shippingAddress: {
//         phoneNumber,
//         email,
//         county,
//         description,
//       },
//       paymentMethod: "M-PESA",
//       paymentCode,
//       status: "Pending",
//     });

//     // Save the order to the database
//     await order.save();

//     res.status(201).json({ message: "Order placed successfully", order });
//   } catch (error) {
//     console.error("Error during checkout:", error);
//     res.status(500).json({ message: "Error during checkout", error });
//   }
// });
router.post("/checkout", async (req, res) => {
  try {
    const {
      cartItems,
      paymentCode,
      firstName,
      lastName,
      phoneNumber,
      email,
      county,
      description,
    } = req.body;

    // Validate cart items
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Check if the requested quantity is available for each product
    for (const item of cartItems) {
      const product = await CustomerProduct.findById(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product ${item.productId} not found` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`,
        });
      }
    }

    // Subtract the quantity from the available stock
    for (const item of cartItems) {
      const product = await CustomerProduct.findById(item.productId);
      product.quantity -= item.quantity; // Subtract the quantity
      await product.save(); // Save the updated product
    }

    // Calculate total price
    const totalPrice = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Create a new order
    const order = new Order({
      products: cartItems.map((item) => ({
        product: item.productId, // Reference to the CustomerProduct
        quantity: item.quantity,
      })),
      totalPrice,
      shippingAddress: {
        firstName,
        lastName,
        phoneNumber,
        email,
        county,
        description,
      },
      paymentMethod: "M-PESA",
      paymentCode,
      status: "Pending",
    });

    // Save the order to the database
    await order.save();

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    console.error("Error during checkout:", error);
    res.status(500).json({ message: "Error during checkout", error });
  }
});
// Fetch all orders with populated product details
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().populate(
      "products.product",
      "name price image"
    ); // Populate only product details

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders", error });
  }
});
// finance check if payment code is available and approve the order
router.put("/finance/approve-order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    // Fetch the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if payment code exists
    if (!order.paymentCode) {
      return res.status(400).json({ message: "Payment code is missing" });
    }

    // Update order status to "Approved" and mark as paid
    order.status = "Approved";
    await order.save();

    res
      .status(200)
      .json({ message: "Order approved and marked as paid", order });
  } catch (error) {
    console.error("Error approving order:", error);
    res.status(500).json({ message: "Error approving order", error });
  }
});
// api for customer to download receipt if the order is approved
router.get("/customer/receipt/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    // Fetch the order with populated product details
    const order = await Order.findById(orderId).populate(
      "products.product",
      "name price"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Approved") {
      return res.status(400).json({ message: "Order is not approved yet" });
    }

    // Generate receipt (you can use a library like `pdfkit` to create a PDF receipt)
    const receipt = {
      orderId: order._id,
      totalPrice: order.totalPrice,
      products: order.products.map((item) => ({
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentCode: order.paymentCode,
      status: order.status,
      createdAt: order.createdAt,
    };

    res
      .status(200)
      .json({ message: "Receipt generated successfully", receipt });
  } catch (error) {
    console.error("Error generating receipt:", error);
    res.status(500).json({ message: "Error generating receipt", error });
  }
});
// inventory get all approved orders
router.get("/inventory/approved-orders", async (req, res) => {
  try {
    const orders = await Order.find({ status: "Approved" }).populate(
      "products.product",
      "name price"
    );

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching approved orders:", error);
    res.status(500).json({ message: "Error fetching approved orders", error });
  }
});
// inventory manager to release the order and update its status to "Released".
router.put("/inventory/release-order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Approved") {
      return res.status(400).json({ message: "Order is not approved yet" });
    }

    // Update order status to "Released"
    order.status = "Released";
    await order.save();

    res.status(200).json({ message: "Order released successfully", order });
  } catch (error) {
    console.error("Error releasing order:", error);
    res.status(500).json({ message: "Error releasing order", error });
  }
});
// This route fetches all released orders for the dispatcher manager.
router.get("/dispatcher/released-orders", async (req, res) => {
  try {
    const orders = await Order.find({ status: "Released" }).populate(
      "products.product",
      "name price"
    );

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching released orders:", error);
    res.status(500).json({ message: "Error fetching released orders", error });
  }
});
// This route allows the dispatcher manager to allocate an order to a driver and update its status to "Dispatched".
router.put("/dispatcher/dispatch-order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Released") {
      return res.status(400).json({ message: "Order is not released yet" });
    }

    // Update order status to "Dispatched"
    order.status = "Dispatched";
    await order.save();

    res.status(200).json({ message: "Order dispatched successfully", order });
  } catch (error) {
    console.error("Error dispatching order:", error);
    res.status(500).json({ message: "Error dispatching order", error });
  }
});
// This route fetches all dispatched orders for the driver.
router.get("/driver/dispatched-orders", async (req, res) => {
  try {
    const orders = await Order.find({ status: "Dispatched" }).populate(
      "products.product",
      "name price"
    );

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching dispatched orders:", error);
    res
      .status(500)
      .json({ message: "Error fetching dispatched orders", error });
  }
});
// This route allows the driver to mark an order as shipped and update its status to "Shipped".
router.put("/driver/ship-order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Dispatched") {
      return res.status(400).json({ message: "Order is not dispatched yet" });
    }

    // Update order status to "Shipped"
    order.status = "Shipped";
    await order.save();

    res.status(200).json({ message: "Order shipped successfully", order });
  } catch (error) {
    console.error("Error shipping order:", error);
    res.status(500).json({ message: "Error shipping order", error });
  }
});
// This route allows the driver to mark an order as delivered and update its status to "Delivered".
router.put("/driver/deliver-order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Shipped") {
      return res.status(400).json({ message: "Order is not shipped yet" });
    }

    // Update order status to "Delivered"
    order.status = "Delivered";
    await order.save();

    res.status(200).json({ message: "Order delivered successfully", order });
  } catch (error) {
    console.error("Error delivering order:", error);
    res.status(500).json({ message: "Error delivering order", error });
  }
});
// This route allows the customer to provide feedback on a delivered order.
router.post("/customer/feedback/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { feedback } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Delivered") {
      return res.status(400).json({ message: "Order is not delivered yet" });
    }

    // Save feedback (you can add a feedback field to the Order schema if needed)
    order.feedback = feedback;
    await order.save();

    res.status(200).json({ message: "Feedback submitted successfully", order });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ message: "Error submitting feedback", error });
  }
});

// Route to get all delivered orders with feedback
router.get("/dispatcher/delivered-orders", async (req, res) => {
  try {
    // Fetch all orders with status "Delivered"
    const deliveredOrders = await Order.find({ status: "Delivered" }).populate(
      "products.product",
      "name price"
    );

    // Check if there are no delivered orders
    if (deliveredOrders.length === 0) {
      return res.status(404).json({ message: "No delivered orders found" });
    }

    // Map through the orders to include feedback (if available)
    const ordersWithFeedback = deliveredOrders.map((order) => ({
      orderId: order._id,
      totalPrice: order.totalPrice,
      products: order.products.map((item) => ({
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentCode: order.paymentCode,
      status: order.status,
      feedback: order.feedback || "No feedback provided", // Include feedback if available
    }));

    // Return the list of delivered orders with feedback
    res.status(200).json({
      message: "Delivered orders fetched successfully",
      orders: ordersWithFeedback,
    });
  } catch (error) {
    console.error("Error fetching delivered orders:", error);
    res.status(500).json({ message: "Error fetching delivered orders", error });
  }
});
module.exports = router;
