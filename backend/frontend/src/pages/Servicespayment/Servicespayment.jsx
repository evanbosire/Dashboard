import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchServicesPayment } from "../../redux/actions/servicespaymentActions";
import Table from "../../components/Table/Table";
import { ThreeDots } from "react-loader-spinner"; // Import the spinner
import "./servicespayment.scss";

const columns = [
  "_id",
  "customerDetails",
  "Location",
  "ServiceName",
  "BookingDate",
  "ServicingDate",
  "AmountPaid",
  "PaymentDate",
  "PaymentStatus",
];

function Servicespayment() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { servicesPayments, loading } = useSelector(
    (state) => state.servicesPayments
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const email = sessionStorage.getItem("email");
    if (!email) {
      navigate("/login");
    } else {
      dispatch(fetchServicesPayment()); // Fetch data from the backend
    }
  }, [dispatch, navigate]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const formatCustomerDetails = (details) => {
    if (details) {
      return `Customer Name: ${details.driverName}\n , Email: ${details.Email}\n, Phone: ${details.Phone}`;
    }
    return "";
  };

  const processedData = servicesPayments.map((item) => ({
    ...item,
    customerDetails: formatCustomerDetails(item.customerDetails),
  }));

  const filteredData = processedData.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="servicespaymentContainer">
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
          <div className="title">SERVICE PAYMENT REPORT</div>
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

export default Servicespayment;
