import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomers,
  reactivateCustomer,
} from "../../redux/actions/customerActions";
import Table from "../../components/Table/Table";
import { useNavigate } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner"; // Import the spinner
import "./suspended.scss";

const columns = ["_id", "customerName", "gender", "phone", "email", "location"];

function Suspended() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const customersState = useSelector((state) => state.customers || {});
  const { suspended = [], loading = false } = customersState;
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchCustomers("suspended"));

    const email = sessionStorage.getItem("email");
    if (!email) {
      navigate("/login");
    }
  }, [dispatch, navigate]);

  const handleReactivate = (id) => {
    dispatch(reactivateCustomer(id));
  };

  const actions = [
    {
      label: "Activate",
      onClick: handleReactivate,
    },
  ];

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = suspended.filter((customer) =>
    Object.values(customer).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="suspended-container">
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
          <div className="title">SUSPENDED CUSTOMERS</div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <Table columns={columns} data={filteredData} actions={actions} />
        </>
      )}
    </div>
  );
}

export default Suspended;
