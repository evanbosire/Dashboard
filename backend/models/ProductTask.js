// const mongoose = require("mongoose");

// const ProductTaskSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     quantity: { type: Number, required: true },
//     image: { type: String, required: true },
//     // ✅ Add these fields to track allocation
//     allocatedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
//     allocatedAt: { type: Date },
//     quantityAllocated: { type: Number, default: 0 },
//   },

//   { timestamps: true }
// );

// module.exports = mongoose.model("ProductTask", ProductTaskSchema);

const mongoose = require("mongoose");

const ProductTaskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true }, // ✅ Store product image
    description: { type: String, required: true }, // ✅ Store product description
    price: { type: Number, required: true }, // ✅ Store product price
    inStock: { type: Boolean, default: true }, // ✅ Track if the product is in stock

    // ✅ Track quantity allocation and posting
    allocatedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    allocatedAt: { type: Date },
    quantityAllocated: { type: Number, default: 0 },
    quantityPosted: { type: Number, default: 0 }, // ✅ Track posted quantity

    // ✅ Product lifecycle tracking
    status: {
      type: String,
      enum: [
        "posted",
        "ordered",
        "paid",
        "dispatched",
        "delivered",
        "feedback_received",
      ],
      default: "posted",
    },

    // ✅ Order tracking
    orderDetails: {
      customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
      orderId: { type: String },
      orderedAt: { type: Date },
      paymentCode: { type: String },
      deliveryLocation: { type: String },
    },

    // ✅ Dispatch tracking
    dispatchDetails: {
      dispatcherId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
      dispatchedAt: { type: Date },
    },

    // ✅ Delivery and feedback
    deliveryDetails: {
      driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
      deliveredAt: { type: Date },
      customerFeedback: {
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductTask", ProductTaskSchema);
