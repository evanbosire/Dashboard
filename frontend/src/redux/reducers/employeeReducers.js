// employeeReducer.js
import {
  FETCH_EMPLOYEES,
  INACTIVATE_EMPLOYEE,
  ACTIVATE_EMPLOYEE,
  SET_LOADING,
} from "../actions/employeeActions";

const initialState = {
  active: [],
  inactive: [],
  loading: false,
};

const employeeReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_EMPLOYEES:
      return {
        ...state,
        [action.payload.status]: action.payload.data,
      };
    case INACTIVATE_EMPLOYEE:
      return {
        ...state,
        active: state.active.filter(
          (employee) => employee._id !== action.payload
        ),
        inactive: [
          ...state.inactive,
          state.active.find((employee) => employee._id === action.payload),
        ],
      };
    case ACTIVATE_EMPLOYEE:
      const employeeToActivate = state.inactive.find(
        (employee) => employee._id === action.payload
      );
      return {
        ...state,
        active: [...state.active, employeeToActivate],
        inactive: state.inactive.filter(
          (employee) => employee._id !== action.payload
        ),
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

export default employeeReducer;
