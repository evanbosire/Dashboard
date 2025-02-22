// src/actions/orderActions.js
import axios from "axios";

export const FETCH_ORDERS = "FETCH_ORDERS";
export const SET_LOADING = "SET_LOADING";
export const SET_ERROR = "SET_ERROR";

export const fetchOrders = () => async (dispatch) => {
  dispatch({ type: SET_LOADING, payload: true });

  try {
    const response = await axios.get(
      "https://backend-n0lb.onrender.com/api/orders"
    );
    dispatch({
      type: FETCH_ORDERS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: SET_ERROR,
      payload: error.message,
    });
  } finally {
    dispatch({ type: SET_LOADING, payload: false });
  }
};
