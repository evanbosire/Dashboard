// const mongoose = require("mongoose");

// const OrderSchema = new mongoose.Schema({
//   customer: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Customer",
//     require: true,
//   },
//   products: [
//     {
//       name: {
//         type: String,
//         required: true,
//       },
//       quantity: {
//         type: Number,
//         required: true,
//       },
//       price: {
//         type: Number,
//         required: true,
//       },
//       image: {
//         type: String,
//         required: true,
//       },
//     },
//   ],
//   totalPrice: {
//     type: Number,
//     required: true,
//   },
//   shippingAddress: {
//     name: {
//       type: String,
//       required: true,
//     },
//     mobileNo: {
//       type: String,
//       required: true,
//     },
//     houseNo: {
//       type: String,
//       required: true,
//     },
//     street: {
//       type: String,
//       required: true,
//     },
//     landmark: {
//       type: String,
//       required: true,
//     },
//     postalCode: {
//       type: String,
//       required: true,
//     },
//   },
//   paymentMethode: {
//     type: String,
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const Order = mongoose.model("Order", OrderSchema);

// module.exports = Order;

const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer", // Reference to the Customer model
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CustomerProduct", // Reference to the CustomerProduct model
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
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
