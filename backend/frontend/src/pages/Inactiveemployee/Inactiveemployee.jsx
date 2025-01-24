import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEmployees,
  activateEmployee,
} from "../../redux/actions/employeeActions";
import Table from "../../components/Table/Table";
import { useNavigate } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner"; // Import the spinner
import "./inactiveemployee.scss";

const columns = [
  "_id",
  "firstName",
  "lastName",
  "gender",
  "phoneNumber",
  "email",
  "role",
  "county",
];

function Inactive() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { inactive = [], loading = false } = useSelector(
    (state) => state.employees || {}
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Check if user is logged in
    const email = sessionStorage.getItem("email");
    if (!email) {
      navigate("/login");
    } else {
      // Fetch inactive employees
      dispatch(fetchEmployees("inactive"));
    }
  }, [dispatch, navigate]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = inactive.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleActivate = (id) => {
    dispatch(activateEmployee(id));
  };

  const actions = [
    {
      label: "Activate",
      onClick: handleActivate,
    },
  ];

  return (
    <div className="inactiveemployee">
      {loading ? (
        <div className="loaderContainer">
          <ThreeDots
            height="80"
            width="80"
            radius="9"
            color="#3498db"
            ariaLabel="three-dots-loading"
          />
          <div className="loadingMessage">Loading...</div>
        </div>
      ) : (
        <>
          <div className="title">INACTIVE EMPLOYEES</div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <Table
            columns={columns}
            data={filteredData}
            actions={actions}
            loading={loading}
          />
        </>
      )}
    </div>
  );
}

export default Inactive;
