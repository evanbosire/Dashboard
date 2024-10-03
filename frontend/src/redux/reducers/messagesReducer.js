// reducers/messagesReducer.js
import { FETCH_MESSAGES_DATA, SET_LOADING } from "../actions/messagesActions";

const initialState = {
  messagesData: [],
  loading: false,
};

const messagesReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MESSAGES_DATA:
      return {
        ...state,
        messagesData: action.payload,
        loading: false,
      };
    case SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

export default messagesReducer;
