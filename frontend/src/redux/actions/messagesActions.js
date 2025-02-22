// actions/messagesActions.js
import axios from "axios";

export const FETCH_MESSAGES_DATA = "FETCH_MESSAGES_DATA";
export const SET_LOADING = "SET_LOADING";

export const fetchMessagesData = () => async (dispatch) => {
  dispatch({ type: SET_LOADING, payload: true });

  try {
    const response = await axios.get(
      "https://backend-n0lb.onrender.com/api/messages"
    );
    dispatch({
      type: FETCH_MESSAGES_DATA,
      payload: response.data,
    });
  } catch (error) {
    console.error("Error fetching messages data:", error);
  } finally {
    dispatch({ type: SET_LOADING, payload: false });
  }
};
