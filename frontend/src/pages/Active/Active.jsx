import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomers,
  suspendCustomer,
} from "../../redux/actions/customerActions";
import Table from "../../components/Table/Table";
import { useNavigate } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner"; // Import the spinner
import "./active.scss";

const columns = ["_id", "customerName", "gender", "phone", "email", "location"];

function Active() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { active = [], loading = false } = useSelector(
    (state) => state.customers || {}
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchCustomers("active"));

    const email = sessionStorage.getItem("email");
    if (!email) {
      navigate("/login");
    }
  }, [dispatch, navigate]);

  const handleSuspend = (id) => {
    dispatch(suspendCustomer(id));
  };

  const actions = [
    {
      label: "Suspend",
      onClick: handleSuspend,
    },
  ];

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = active.filter(
    (customer) =>
      customer &&
      Object.values(customer).some((value) =>
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="active-container">
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
          <div className="title">ACTIVE CUSTOMERS</div>
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

export default Active;
