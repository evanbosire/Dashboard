import axios from "axios";

export const FETCH_CUSTOMERS = "FETCH_CUSTOMERS";
export const APPROVE_CUSTOMER = "APPROVE_CUSTOMER";
export const REJECT_CUSTOMER = "REJECT_CUSTOMER";
export const REVERT_CUSTOMER = "REVERT_CUSTOMER";
export const SUSPEND_CUSTOMER = "SUSPEND_CUSTOMER";
export const REACTIVATE_CUSTOMER = "REACTIVATE_CUSTOMER";
export const SET_LOADING = "SET_LOADING";

export const fetchCustomers = (status) => async (dispatch) => {
  dispatch({ type: SET_LOADING, payload: true });

  try {
    const response = await axios.get(
      `http://localhost:5000/api/customers/${status}`
    );
    dispatch({
      type: FETCH_CUSTOMERS,
      payload: { status, data: response.data },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
  } finally {
    dispatch({ type: SET_LOADING, payload: false });
  }
};

// Approve customer action
export const approveCustomer = (id) => async (dispatch) => {
  dispatch({ type: SET_LOADING, payload: true });
  try {
    if (!id) {
      throw new Error("Customer ID is required.");
    }
    await axios.patch(`http://localhost:5000/api/customers/approve/${id}`);
    dispatch({ type: APPROVE_CUSTOMER, payload: id });
    dispatch(fetchCustomers("pending")); // Refetch pending customers
    dispatch(fetchCustomers("active")); // Refetch active customers
  } catch (error) {
    console.error("Error approving customer:", error);
  } finally {
    dispatch({ type: SET_LOADING, payload: false });
  }
};

// Suspend customer action
export const suspendCustomer = (id) => async (dispatch) => {
  dispatch({ type: SET_LOADING, payload: true });

  try {
    const response = await axios.patch(
      `http://localhost:5000/api/customers/suspend/${id}`
    );
    dispatch({ type: SUSPEND_CUSTOMER, payload: response.data });

    // Optionally, refetch the customers to update the UI
    dispatch(fetchCustomers("active"));
    dispatch(fetchCustomers("suspended"));
  } catch (error) {
    console.error("Error suspending customer:", error);
  } finally {
    dispatch({ type: SET_LOADING, payload: false });
  }
};

// Reactivate customer action
export const reactivateCustomer = (id) => async (dispatch) => {
  dispatch({ type: SET_LOADING, payload: true });

  try {
    // Make the PATCH request to reactivate the customer
    const response = await axios.patch(
      `http://localhost:5000/api/customers/reactivate/${id}`
    );

    // Dispatch the action to update the customer state in Redux
    dispatch({ type: REACTIVATE_CUSTOMER, payload: response.data });

    // Optionally, refetch customers to update the UI
    dispatch(fetchCustomers("active"));
    dispatch(fetchCustomers("suspended"));
  } catch (error) {
    console.error("Error reactivating customer:", error);
  } finally {
    dispatch({ type: SET_LOADING, payload: false });
  }
};

// Reject customer action
export const rejectCustomer = (id) => async (dispatch) => {
  dispatch({ type: SET_LOADING, payload: true });

  try {
    if (!id) {
      throw new Error("Customer ID is required.");
    }

    // Make the PATCH request to reject the customer
    await axios.patch(`http://localhost:5000/api/customers/reject/${id}`);

    // Dispatch the action to update the customer state in Redux
    dispatch({ type: REJECT_CUSTOMER, payload: id });

    // Optionally, refetch the customers to update the UI
    dispatch(fetchCustomers("pending")); // Refetch pending customers
    dispatch(fetchCustomers("rejected")); // Refetch rejected customers
  } catch (error) {
    console.error("Error rejecting customer:", error);
  } finally {
    dispatch({ type: SET_LOADING, payload: false });
  }
};

// revertRejectedCustomer action
export const revertRejectedCustomer = (id) => async (dispatch) => {
  dispatch({ type: SET_LOADING, payload: true });

  try {
    if (!id) throw new Error("Customer ID is required.");
    await axios.patch(`http://localhost:5000/api/customers/revert/${id}`);
    dispatch({ type: REVERT_CUSTOMER, payload: id });
    dispatch(fetchCustomers("pending"));
    dispatch(fetchCustomers("rejected"));
  } catch (error) {
    console.error("Error reverting rejected customer:", error);
  } finally {
    dispatch({ type: SET_LOADING, payload: false });
  }
};
