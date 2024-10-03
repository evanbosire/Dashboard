// src/actions/orderActions.js
import axios from "axios";

export const FETCH_ORDERS = "FETCH_ORDERS";
export const SET_LOADING = "SET_LOADING";
export const SET_ERROR = "SET_ERROR";

export const fetchOrders = () => async (dispatch) => {
  dispatch({ type: SET_LOADING, payload: true });

  try {
    const response = await axios.get("http://localhost:5000/api/orders");
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
