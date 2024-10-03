// reducers/servicesofferedReducer.js
import {
  FETCH_SERVICES_OFFERED,
  SET_LOADING,
} from "../actions/servicesofferedActions";

const initialState = {
  servicesOffered: [],
  loading: false,
};

const servicesOfferedReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SERVICES_OFFERED:
      return {
        ...state,
        servicesOffered: action.payload,
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

export default servicesOfferedReducer;
