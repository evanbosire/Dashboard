// store.js
import { configureStore } from "@reduxjs/toolkit";
import orderReducer from "./reducers/orderReducer";
import customerReducer from "./reducers/customerReducers";
import customerCountsReducer from "../../src/redux/slices/customerCountsSlice";
import employeeReducer from "./reducers/employeeReducers";
import paymentsReducer from "./reducers/paymentReducer";
import shipmentsReducer from "./reducers/shipmentsReducer";
import suppliesReducer from "./reducers/suppliesReducer";
import requestedReducer from "./reducers/requestedReducer";
import servicesOfferedReducer from "./reducers/servicesofferedReducer";
import servicesPaymentReducer from "./reducers/servicespaymentReducer";
import productionReducer from "./reducers/productionReducer";
import messagesReducer from "./reducers/messagesReducer";

const store = configureStore({
  reducer: {
    customers: customerReducer,
    customerCounts: customerCountsReducer,
    employees: employeeReducer,
    orders: orderReducer,
    payments: paymentsReducer,
    shipments: shipmentsReducer,
    supplies: suppliesReducer,
    requested: requestedReducer,
    servicesOffered: servicesOfferedReducer,
    servicesPayments: servicesPaymentReducer,
    production: productionReducer,
    messages: messagesReducer,
  },
});

export default store;
