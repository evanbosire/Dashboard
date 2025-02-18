const mongoose = require("mongoose");

const ProductTaskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },

    // ❌ Change `required: true` to `required: false`
    description: { type: String, required: false }, // ✅ Now optional
    price: { type: Number, required: false }, // ✅ Now optional

    inStock: { type: Boolean, default: true },
    allocatedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    allocatedAt: { type: Date },
    quantityAllocated: { type: Number, default: 0 },
    quantityPosted: { type: Number, default: 0 },

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

    orderDetails: {
      customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
      orderId: { type: String },
      orderedAt: { type: Date },
      paymentCode: { type: String },
      deliveryLocation: { type: String },
    },

    dispatchDetails: {
      dispatcherId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
      dispatchedAt: { type: Date },
    },

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
