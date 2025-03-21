import React, { useEffect, useState } from "react";
import Table from "../../components/Table/Table";
import { ThreeDots } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./orders.scss";

// Update "Email" to "Customer Email" in the columns array
const columns = [
  "Customer Name",
  "Phone Number",
  "Customer Email",
  "County to Deliver",
  "Location Description",
  "Product Name",
  "Quantity",
  "Order Status",
  "Customer Feedback",
  "Order Date",
];

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const email = sessionStorage.getItem("email");
    if (!email) {
      navigate("/login");
    } else {
      fetchOrders();
    }
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://backend-n0lb.onrender.com/api/orders/report"
      );
      setOrders(response.data.orders);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Update "Email" to "Customer Email" in the processed data
  const processedData = orders.flatMap((order) => {
    return order.products.map((product) => {
      return {
        "Customer Name": `${order.firstName} ${order.lastName}`,
        "Phone Number": order.phoneNumber,
        "Customer Email": order.email,
        "County to Deliver": order.county,
        "Location Description": order.description,
        "Product Name": product.productName,
        Quantity: product.quantity,
        "Order Status": order.status,
        "Customer Feedback": order.feedback || "No feedback",
        "Order Date": new Date(order.createdAt).toLocaleDateString(),
      };
    });
  });

  // Filter data based on search query
  const filteredData = processedData.filter((order) => {
    return Object.values(order).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="ordersContainer">
      <div className="title">ORDERS REPORT</div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {loading && (
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
      )}

      {error && <div className="errorMessage">Error: {error}</div>}

      {!loading &&
        !error &&
        (filteredData.length > 0 ? (
          <Table columns={columns} data={filteredData} />
        ) : (
          <div className="noOrders">No orders found</div>
        ))}
    </div>
  );
}

export default Orders;