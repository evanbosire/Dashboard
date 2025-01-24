import axios from "axios";

// Action types
export const FETCH_EMPLOYEES = "FETCH_EMPLOYEES";
export const INACTIVATE_EMPLOYEE = "INACTIVATE_EMPLOYEE";
export const ACTIVATE_EMPLOYEE = "ACTIVATE_EMPLOYEE";
export const SET_LOADING = "SET_LOADING";

// Fetch employees
export const fetchEmployees = (status) => async (dispatch) => {
  dispatch({ type: SET_LOADING, payload: true });

  try {
    const response = await axios.get(
      `https://dashboard-76od.onrender.com/api/employees/${status}`
    );
    dispatch({
      type: FETCH_EMPLOYEES,
      payload: { status, data: response.data },
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
  } finally {
    dispatch({ type: SET_LOADING, payload: false });
  }
};

// Inactivate employee action
export const inactivateEmployee = (id) => async (dispatch) => {
  dispatch({ type: SET_LOADING, payload: true });

  try {
    if (!id) {
      throw new Error("Employee ID is required.");
    }

    // Make the PATCH request to inactivate employee
    await axios.patch(
      `https://dashboard-76od.onrender.com/api/employees/inactivate/${id}`
    );

    // Dispatch the action to update the employee state in Redux
    dispatch({ type: INACTIVATE_EMPLOYEE, payload: id });

    // Optionally, refetch the employees to update the UI
    dispatch(fetchEmployees("active")); // Refetch active Employees
    dispatch(fetchEmployees("inactive")); // Refetch inactive Employees
  } catch (error) {
    console.error("Error inactivating employee:", error);
  } finally {
    dispatch({ type: SET_LOADING, payload: false });
  }
};

// Activate employee action
export const activateEmployee = (id) => async (dispatch) => {
  dispatch({ type: SET_LOADING, payload: true });

  try {
    if (!id) throw new Error("Employee ID is required.");
    await axios.patch(
      `https://dashboard-76od.onrender.com/api/employees/activate/${id}`
    );
    dispatch({ type: ACTIVATE_EMPLOYEE, payload: id });
    dispatch(fetchEmployees("active"));
    dispatch(fetchEmployees("inactive"));
  } catch (error) {
    console.error("Error activating employee:", error);
  } finally {
    dispatch({ type: SET_LOADING, payload: false });
  }
};
