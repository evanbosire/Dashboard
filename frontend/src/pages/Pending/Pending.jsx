import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomers,
  approveCustomer,
  rejectCustomer,
} from "../../redux/actions/customerActions";
import Table from "../../components/Table/Table";
import { useNavigate } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner"; // Import the spinner
import "./pending.scss";

const columns = ["_id", "customerName", "gender", "phone", "email", "location"];

function Pending() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pending = [], loading = false } = useSelector(
    (state) => state.customers || {}
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPendingCustomers = async () => {
      try {
        await dispatch(fetchCustomers("pending"));
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchPendingCustomers();

    const email = sessionStorage.getItem("email");
    if (!email) {
      navigate("/login");
    }
  }, [dispatch, navigate]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = pending.filter((customer) =>
    Object.values(customer).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleApprove = (id) => {
    dispatch(approveCustomer(id));
  };

  const handleReject = (id) => {
    dispatch(rejectCustomer(id));
  };

  const actions = [
    {
      label: "Approve",
      onClick: handleApprove,
    },
    {
      label: "Reject",
      onClick: handleReject,
    },
  ];

  return (
    <div className="pending-container">
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
          <div className="title">PENDING CUSTOMERS</div>
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

export default Pending;
