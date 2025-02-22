import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchPayments = createAsyncThunk(
  "payments/fetchPayments",
  async () => {
    try {
      const response = await axios.get(
        "https://backend-n0lb.onrender.com/api/payments"
      ); // Correct path
      return response.data;
    } catch (error) {
      throw new Error(
        error.response.data.message || "Failed to fetch payments"
      );
    }
  }
);
