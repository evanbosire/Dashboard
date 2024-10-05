// actions/productionActions.js
import axios from "axios";

export const FETCH_PRODUCTION_DATA = "FETCH_PRODUCTION_DATA";
export const SET_LOADING = "SET_LOADING";

export const fetchProductionData = () => async (dispatch) => {
  dispatch({ type: SET_LOADING, payload: true });

  try {
    const response = await axios.get(
      "https://dashboard-76od.onrender.com/api/productions"
    );
    dispatch({
      type: FETCH_PRODUCTION_DATA,
      payload: response.data,
    });
  } catch (error) {
    console.error("Error fetching production data:", error);
  } finally {
    dispatch({ type: SET_LOADING, payload: false });
  }
};
