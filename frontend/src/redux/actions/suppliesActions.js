import axios from "axios";

// Define action types
export const FETCH_SUPPLIES_REQUEST = "FETCH_SUPPLIES_REQUEST";
export const FETCH_SUPPLIES_SUCCESS = "FETCH_SUPPLIES_SUCCESS";
export const FETCH_SUPPLIES_FAILURE = "FETCH_SUPPLIES_FAILURE";

// Define action creators
export const fetchSuppliesRequest = () => ({
  type: FETCH_SUPPLIES_REQUEST,
});

export const fetchSuppliesSuccess = (data) => ({
  type: FETCH_SUPPLIES_SUCCESS,
  payload: data,
});

export const fetchSuppliesFailure = (error) => ({
  type: FETCH_SUPPLIES_FAILURE,
  payload: error,
});

// Define async action for fetching supplies
export const fetchSupplies = () => async (dispatch) => {
  dispatch(fetchSuppliesRequest()); // Notify that fetching is starting

  try {
    const response = await axios.get("http://localhost:5000/api/supplies");
    dispatch(fetchSuppliesSuccess(response.data)); // Dispatch success action with data
  } catch (error) {
    dispatch(fetchSuppliesFailure(error.message)); // Dispatch failure action with error message
  }
};
