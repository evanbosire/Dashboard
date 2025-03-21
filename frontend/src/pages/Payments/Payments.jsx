import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "../../components/Table/Table";
import { ThreeDots } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import "./payments.scss";

const columns = [
  "Customer Name",
  "Phone Number",
  "Email",
  "Products",
  "Date Paid",
  "Transaction Code",
  "Amount Paid",
  "Payment Method",
  "Payment Status",
];

function Payments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get(
          "https://backend-n0lb.onrender.com/api/orders-payment/report"
        );
        const ordersData = response.data.orders || [];
        setPayments(ordersData);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch payments"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();

    const email = sessionStorage.getItem("email");
    if (!email) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Transform the data to match the table columns
  const transformedData = payments.map((order) => {
    const productsList = (order.products || [])
      .map(
        (product) =>
          `${product.productName || "Unknown"} (${product.quantity || 0})`
      )
      .join(", ");

    return {
      "Customer Name":
        `${order.firstName || ""} ${order.lastName || ""}`.trim() || "N/A",
      "Phone Number": order.phoneNumber || "N/A",
      Email: order.email || "N/A",
      Products: productsList || "N/A",
      "Date Paid": order.createdAt
        ? new Date(order.createdAt).toLocaleDateString()
        : "N/A",
      "Transaction Code": order.paymentCode || "N/A",
      "Amount Paid": order.totalPrice
        ? `KSh ${order.totalPrice.toLocaleString()}`
        : "N/A",
      "Payment Method": order.paymentMethod || "N/A",
      "Payment Status": order.status || "N/A",
    };
  });

  // Filter the transformed data based on search query
  const filteredData = transformedData.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
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
        <div className="loadingMessage">Loading payments...</div>
      </div>
    );
  }

  if (error) {
    return <div className="errorMessage">⚠️ Error: {error}</div>;
  }

  return (
    <div className="paymentsContainer">
      <div className="title">ORDER PAYMENT REPORT</div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search payments..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {filteredData.length > 0 ? (
        <Table columns={columns} data={filteredData} />
      ) : (
        <div className="noDataMessage">No matching payments found.</div>
      )}
    </div>
  );
}

export default Payments;
