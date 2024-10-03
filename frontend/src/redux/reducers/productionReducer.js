// reducers/productionReducer.js
import {
  FETCH_PRODUCTION_DATA,
  SET_LOADING,
} from "../actions/productionActions";

const initialState = {
  productionData: [],
  loading: false,
};

const productionReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PRODUCTION_DATA:
      return {
        ...state,
        productionData: action.payload,
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

export default productionReducer;
