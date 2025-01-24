import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEmployees,
  inactivateEmployee,
} from "../../redux/actions/employeeActions";
import Table from "../../components/Table/Table";
import { useNavigate } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner"; // Import the spinner
import "./activeemployee.scss";

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

function Active() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { active, loading } = useSelector((state) => state.employees || {});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Check if user is logged in
    const email = sessionStorage.getItem("email");
    if (!email) {
      navigate("/login");
    } else {
      // Fetch active and inactive employees
      dispatch(fetchEmployees("active"));
      dispatch(fetchEmployees("inactive")); // Also fetch inactive employees
    }
  }, [dispatch, navigate]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = active.filter((employee) =>
    Object.values(employee).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleInactivate = (id) => {
    dispatch(inactivateEmployee(id));
  };

  const actions = [
    {
      label: "Suspend",
      onClick: handleInactivate,
    },
  ];

  return (
    <div className="activeemployee">
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
          <div className="title">ACTIVE EMPLOYEES</div>
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
            loading={loading}
            actions={actions}
          />
        </>
      )}
    </div>
  );
}

export default Active;
