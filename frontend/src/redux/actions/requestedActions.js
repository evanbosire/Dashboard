// actions/requestedActions.js
import axios from "axios";

export const FETCH_REQUESTED_MATERIALS = "FETCH_REQUESTED_MATERIALS";
export const SET_LOADING = "SET_LOADING";

export const fetchRequestedMaterials = () => async (dispatch) => {
  dispatch({ type: SET_LOADING, payload: true });

  try {
    const response = await axios.get(
      "https://backend-n0lb.onrender.com/api/requested"
    );
    dispatch({
      type: FETCH_REQUESTED_MATERIALS,
      payload: response.data,
    });
  } catch (error) {
    console.error("Error fetching requested materials:", error);
  } finally {
    dispatch({ type: SET_LOADING, payload: false });
  }
};
