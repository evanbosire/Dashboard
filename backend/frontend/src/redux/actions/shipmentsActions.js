import axios from "axios";

// Define action types
export const FETCH_SHIPMENTS = "FETCH_SHIPMENTS";
export const SET_LOADING = "SET_LOADING";
export const SET_ERROR = "SET_ERROR";

// Define action creators
export const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading,
});

export const setError = (error) => ({
  type: SET_ERROR,
  payload: error,
});

export const fetchShipments = () => async (dispatch) => {
  dispatch(setLoading(true)); // Set loading state to true

  try {
    const response = await axios.get(
      "https://dashboard-76od.onrender.com/api/shipments"
    ); // Adjust endpoint as necessary
    dispatch({
      type: FETCH_SHIPMENTS,
      payload: response.data, // Dispatch fetched data
    });
  } catch (error) {
    dispatch(setError(error.message)); // Dispatch error message
  } finally {
    dispatch(setLoading(false)); // Set loading state to false
  }
};
