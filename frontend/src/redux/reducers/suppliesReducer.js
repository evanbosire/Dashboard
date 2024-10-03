import {
  FETCH_SUPPLIES_REQUEST,
  FETCH_SUPPLIES_SUCCESS,
  FETCH_SUPPLIES_FAILURE,
} from "../actions/suppliesActions";

const initialState = {
  supplies: [],
  loading: false,
  error: null,
};

const suppliesReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SUPPLIES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_SUPPLIES_SUCCESS:
      return {
        ...state,
        supplies: action.payload,
        loading: false,
        error: null,
      };
    case FETCH_SUPPLIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default suppliesReducer;
