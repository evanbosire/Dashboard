// reducers/requestedReducer.js
import {
  FETCH_REQUESTED_MATERIALS,
  SET_LOADING,
} from "../actions/requestedActions";

const initialState = {
  requestedMaterials: [],
  loading: false,
};

const requestedReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_REQUESTED_MATERIALS:
      return {
        ...state,
        requestedMaterials: action.payload,
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

export default requestedReducer;
