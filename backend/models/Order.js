const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CustomerProduct", // Reference to the CustomerProduct model
        required: true,
      },
      productName: {
        type: String, // Add productName field
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    county: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentCode: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: [
      "Pending",
      "Approved",
      "Cancelled",
      "Released",
      "Dispatched",
      "Shipped",
      "Delivered",
    ],
    default: "Pending",
  },
  feedback: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
