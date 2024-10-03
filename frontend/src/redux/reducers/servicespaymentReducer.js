// reducers/servicespaymentReducer.js
import {
  FETCH_SERVICES_PAYMENT,
  SET_LOADING,
} from "../actions/servicespaymentActions";

const initialState = {
  servicesPayments: [],
  loading: false,
};

const servicesPaymentReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SERVICES_PAYMENT:
      return {
        ...state,
        servicesPayments: action.payload,
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

export default servicesPaymentReducer;
