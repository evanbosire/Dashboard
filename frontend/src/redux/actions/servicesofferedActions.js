// actions/servicesofferedActions.js
import axios from "axios";

export const FETCH_SERVICES_OFFERED = "FETCH_SERVICES_OFFERED";
export const SET_LOADING = "SET_LOADING";

export const fetchServicesOffered = () => async (dispatch) => {
  dispatch({ type: SET_LOADING, payload: true });

  try {
    const response = await axios.get(
      "https://backend-n0lb.onrender.com/api/servicesoffered"
    );
    dispatch({
      type: FETCH_SERVICES_OFFERED,
      payload: response.data,
    });
  } catch (error) {
    console.error("Error fetching services offered:", error);
  } finally {
    dispatch({ type: SET_LOADING, payload: false });
  }
};
