import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../../redux/actions/orderActions";
import Table from "../../components/Table/Table";
import { ThreeDots } from "react-loader-spinner"; // Import the spinner
import { useNavigate } from "react-router-dom";
import "./orders.scss";

const columns = [
  "id",
  "customerName",
  "productDetails",
  "totalCost",
  "orderStatus",
];

function Orders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const orders = useSelector((state) => state.orders.orders);
  const loading = useSelector((state) => state.orders.loading);
  const error = useSelector((state) => state.orders.error);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    const email = sessionStorage.getItem("email");
    if (!email) {
      navigate("/login");
    }
  }, [navigate]);

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Debugging: Log the orders and search query
  useEffect(() => {
    console.log("Orders:", orders);
    console.log("Search Query:", searchQuery);
  }, [orders, searchQuery]);

  const filteredData = orders
    .filter((order) => {
      // Debugging: Log order details
      console.log("Filtering Order:", order);
      return (
        order.customer.customerName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        order.products.some((product) =>
          `${product.productDescription} (${product.quantity})`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        ) ||
        `${order.totalAmount}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        order.orderStatus.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .map((order) => ({
      id: order._id,
      customerName: order.customer.customerName,
      productDetails: order.products
        .map((p) => `${p.productDescription} (${p.quantity})`)
        .join(", "),
      totalCost: `Kshs ${order.totalAmount}`,
      orderStatus: order.orderStatus,
    }));

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
      {!loading && !error && <Table columns={columns} data={filteredData} />}
    </div>
  );
}

export default Orders;
