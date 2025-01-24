import {
  FETCH_CUSTOMERS,
  APPROVE_CUSTOMER,
  REJECT_CUSTOMER,
  SUSPEND_CUSTOMER,
  REACTIVATE_CUSTOMER,
  REVERT_CUSTOMER,
  SET_LOADING,
} from "../actions/customerActions";

const initialState = {
  pending: [],
  active: [], // Ensure this is initialized as an empty array
  suspended: [],
  rejected: [],
  loading: false,
};

const customerReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CUSTOMERS:
      return {
        ...state,
        [action.payload.status]: action.payload.data,
      };
    case APPROVE_CUSTOMER:
      return {
        ...state,
        pending: state.pending.filter(
          (customer) => customer._id !== action.payload
        ),
        active: [
          ...state.active,
          state.pending.find((customer) => customer._id === action.payload),
        ],
      };
    case REJECT_CUSTOMER:
      return {
        ...state,
        pending: state.pending.filter(
          (customer) => customer._id !== action.payload
        ),
        rejected: [
          ...state.rejected,
          state.pending.find((customer) => customer._id === action.payload),
        ],
      };
    case REVERT_CUSTOMER:
      const customerToRevert = state.rejected.find(
        (customer) => customer._id === action.payload
      );
      return {
        ...state,
        pending: [...state.pending, customerToRevert],
        rejected: state.rejected.filter(
          (customer) => customer._id !== action.payload
        ),
      };
    case SUSPEND_CUSTOMER:
      return {
        ...state,
        active: state.active.filter(
          (customer) => customer._id !== action.payload
        ),
        suspended: [
          ...state.suspended,
          state.active.find((customer) => customer._id === action.payload),
        ],
      };
    case REACTIVATE_CUSTOMER:
      return {
        ...state,
        suspended: state.suspended.filter(
          (customer) => customer._id !== action.payload
        ),
        active: [
          ...state.active,
          state.suspended.find((customer) => customer._id === action.payload),
        ],
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

export default customerReducer;
