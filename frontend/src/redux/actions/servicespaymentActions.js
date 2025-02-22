// actions/servicespaymentActions.js
import axios from "axios";

export const FETCH_SERVICES_PAYMENT = "FETCH_SERVICES_PAYMENT";
export const SET_LOADING = "SET_LOADING";

export const fetchServicesPayment = () => async (dispatch) => {
  dispatch({ type: SET_LOADING, payload: true });

  try {
    const response = await axios.get(
      "https://backend-n0lb.onrender.com/api/servicespayments"
    );
    dispatch({
      type: FETCH_SERVICES_PAYMENT,
      payload: response.data,
    });
  } catch (error) {
    console.error("Error fetching services payments:", error);
  } finally {
    dispatch({ type: SET_LOADING, payload: false });
  }
};
