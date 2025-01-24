const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  // customer: {
  //   customerId: mongoose.Schema.Types.ObjectId,
  //   customerName: String,
  // },
  // products: [
  //   {
  //     productId: mongoose.Schema.Types.ObjectId,
  //     quantity: Number,
  //     productDescription: String,
  //   },
  // ],
  // totalAmount: Number,
  // orderStatus: String,
  // receiptUrl: String,
  // createdAt: { type: Date, default: Date.now },
  // updatedAt: { type: Date, default: Date.now },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    require: true,
  },
  products: [
    {
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    name: {
      type: String,
      required: true,
    },
    mobileNo: {
      type: String,
      required: true,
    },
    houseNo: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
  },
  paymentMethode: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
