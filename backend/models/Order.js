const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  customer: {
    customerId: mongoose.Schema.Types.ObjectId,
    customerName: String,
  },
  products: [
    {
      productId: mongoose.Schema.Types.ObjectId,
      quantity: Number,
      productDescription: String,
    },
  ],
  totalAmount: Number,
  orderStatus: String,
  receiptUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
