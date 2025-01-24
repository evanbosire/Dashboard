import {
  FETCH_SHIPMENTS,
  SET_LOADING,
  SET_ERROR,
} from "../actions/shipmentsActions";

const initialState = {
  shipments: [],
  loading: false,
  error: null,
};

const shipmentsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SHIPMENTS:
      return {
        ...state,
        shipments: action.payload,
        loading: false,
        error: null,
      };
    case SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
};

export default shipmentsReducer;
