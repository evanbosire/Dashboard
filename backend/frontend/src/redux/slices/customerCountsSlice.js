import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Define the initial state of the slice
const initialState = {
  pending: 0,
  active: 0,
  suspended: 0,
  rejected: 0,
  status: "idle",
  error: null,
};

// Helper function to fetch count from a specific endpoint
const fetchCountFromEndpoint = async (endpoint) => {
  const response = await fetch(
    `https://dashboard-76od.onrender.com/api/customers/counts/${endpoint}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint} count`);
  }
  const data = await response.json();
  return data[endpoint];
};

// Define an async thunk for fetching customer counts
export const fetchCustomerCounts = createAsyncThunk(
  "customerCounts/fetchCustomerCounts",
  async () => {
    const [pending, active, suspended, rejected] = await Promise.all([
      fetchCountFromEndpoint("pending"),
      fetchCountFromEndpoint("active"),
      fetchCountFromEndpoint("suspended"),
      fetchCountFromEndpoint("rejected"),
    ]);

    return { pending, active, suspended, rejected };
  }
);

// Create the slice
const customerCountsSlice = createSlice({
  name: "customerCounts",
  initialState,
  reducers: {
    updateCountsFromSSE: (state, action) => {
      // Update state with new counts from SSE
      const { pending, active, suspended, rejected } = action.payload;
      state.pending = pending || state.pending;
      state.active = active || state.active;
      state.suspended = suspended || state.suspended;
      state.rejected = rejected || state.rejected;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerCounts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCustomerCounts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.pending = action.payload.pending || 0;
        state.active = action.payload.active || 0;
        state.suspended = action.payload.suspended || 0;
        state.rejected = action.payload.rejected || 0;
      })
      .addCase(fetchCustomerCounts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { updateCountsFromSSE } = customerCountsSlice.actions;

export default customerCountsSlice.reducer;
