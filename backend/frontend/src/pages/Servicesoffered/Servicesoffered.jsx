// src/pages/Servicesoffered/Servicesoffered.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchServicesOffered } from "../../redux/actions/servicesofferedActions";
import Table from "../../components/Table/Table";
import { ThreeDots } from "react-loader-spinner";
import "./servicesoffered.scss";

const columns = [
  "_id",
  "customerDetails",
  "Location",
  "ServiceName",
  "BookingDate",
  "ServicingDate",
  "BookingFee",
  "ServiceFee",
  "PaymentDate",
  "PaymentStatus",
  "BookingStatus",
  "AllocatedPainters",
];

function Servicesoffered() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { servicesOffered, loading } = useSelector(
    (state) => state.servicesOffered
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const email = sessionStorage.getItem("email");
    if (!email) {
      navigate("/login");
    } else {
      dispatch(fetchServicesOffered());
    }
  }, [dispatch, navigate]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const formatCustomerDetails = (details) => {
    if (details) {
      return `Customer Name: ${details.driverName}, Email: ${details.Email}, Phone: ${details.Phone}`;
    }
    return "";
  };

  const formatAllocatedPainters = (painters) => {
    if (painters) {
      // Join painters' names with a space or <br> for separate lines
      return painters.join("  | ");
    }
    return "";
  };

  // Pre-process data to handle nested objects
  const processedData = servicesOffered.map((item) => ({
    ...item,
    customerDetails: formatCustomerDetails(item.customerDetails),
    // Format allocated painters for HTML
    AllocatedPainters: formatAllocatedPainters(item.AllocatedPainters),
  }));

  // Filter data based on search query
  const filteredData = processedData.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="servicesofferedContainer">
      {loading ? (
        <div className="loadingContainer">
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
          <div className="title">SERVICE OFFERED REPORT</div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <Table columns={columns} data={filteredData} />
        </>
      )}
    </div>
  );
}

export default Servicesoffered;
