import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPayments } from "../../redux/actions/paymentActions";
import Table from "../../components/Table/Table";
import { ThreeDots } from "react-loader-spinner"; // Import the spinner
import { useNavigate } from "react-router-dom";
import "./payments.scss";

const columns = [
  "_id",
  "customerName",
  "productDetails",
  "DatePaid",
  "TransactionCode",
  "AmountPaid",
  "ShippingCost",
  "PaymentStatus",
  "PaymentMethod",
];

function Payments() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { payments, loading, error } = useSelector((state) => state.payments);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchPayments());
    const email = sessionStorage.getItem("email");
    if (!email) {
      navigate("/login");
    }
  }, [dispatch, navigate]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Improved search functionality
  const filteredData = payments.filter((item) =>
    columns.some((column) =>
      item[column]
        ? item[column]
            .toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        : false
    )
  );

  if (loading) {
    return (
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
    );
  }

  if (error) {
    return <div className="errorMessage">Error: {error}</div>;
  }

  return (
    <div className="paymentsContainer">
      <div className="title">ORDER PAYMENT REPORT</div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      <Table columns={columns} data={filteredData} />
    </div>
  );
}

export default Payments;
