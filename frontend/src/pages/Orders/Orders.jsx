// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchOrders } from "../../redux/actions/orderActions";
// import Table from "../../components/Table/Table";
// import { ThreeDots } from "react-loader-spinner"; // Import the spinner
// import { useNavigate } from "react-router-dom";
// import "./orders.scss";

// const columns = [
//   "id",
//   "customerName",
//   "productDetails",
//   "totalCost",
//   "orderStatus",
// ];

// function Orders() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const orders = useSelector((state) => state.orders.orders);
//   const loading = useSelector((state) => state.orders.loading);
//   const error = useSelector((state) => state.orders.error);

//   useEffect(() => {
//     dispatch(fetchOrders());
//   }, [dispatch]);

//   useEffect(() => {
//     const email = sessionStorage.getItem("email");
//     if (!email) {
//       navigate("/login");
//     }
//   }, [navigate]);

//   const [searchQuery, setSearchQuery] = useState("");

//   const handleSearchChange = (event) => {
//     setSearchQuery(event.target.value);
//   };

//   // Debugging: Log the orders and search query
//   useEffect(() => {
//     console.log("Orders:", orders);
//     console.log("Search Query:", searchQuery);
//   }, [orders, searchQuery]);

//   const filteredData = orders
//     .filter((order) => {
//       // Debugging: Log order details
//       console.log("Filtering Order:", order);
//       return (
//         order.customer.customerName
//           .toLowerCase()
//           .includes(searchQuery.toLowerCase()) ||
//         order.products.some((product) =>
//           `${product.productDescription} (${product.quantity})`
//             .toLowerCase()
//             .includes(searchQuery.toLowerCase())
//         ) ||
//         `${order.totalAmount}`
//           .toLowerCase()
//           .includes(searchQuery.toLowerCase()) ||
//         order.orderStatus.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     })
//     .map((order) => ({
//       id: order._id,
//       customerName: order.customer.customerName,
//       productDetails: order.products
//         .map((p) => `${p.productDescription} (${p.quantity})`)
//         .join(", "),
//       totalCost: `Kshs ${order.totalAmount}`,
//       orderStatus: order.orderStatus,
//     }));

//   return (
//     <div className="ordersContainer">
//       <div className="title">ORDERS REPORT</div>
//       <div className="search-bar">
//         <input
//           type="text"
//           placeholder="Search..."
//           value={searchQuery}
//           onChange={handleSearchChange}
//         />
//       </div>
//       {loading && (
//         <div className="loadingContainer">
//           <ThreeDots
//             height="80"
//             width="80"
//             radius="9"
//             color="#3498db"
//             ariaLabel="three-dots-loading"
//           />
//           <div className="loadingMessage">Loading...</div>
//         </div>
//       )}
//       {error && <div className="errorMessage">Error: {error}</div>}
//       {!loading && !error && <Table columns={columns} data={filteredData} />}
//     </div>
//   );
// }

// export default Orders;
// import React, { useEffect, useState } from "react";
// import Table from "../../components/Table/Table";
// import { ThreeDots } from "react-loader-spinner";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./orders.scss";

// // Use the specified columns
// const columns = [
//   "Customer Name",
//   "Phone Number",
//   "Email",
//   "County to Deliver",
//   "Location Description",
//   "Product Name",
//   "Quantity",
//   "Order Status",
//   "Customer Feedback",
//   "Order Date",
// ];

// function Orders() {
//   const navigate = useNavigate();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     const email = sessionStorage.getItem("email");
//     if (!email) {
//       navigate("/login");
//     } else {
//       fetchOrders();
//     }
//   }, [navigate]);

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(
//         "http://localhost:5000/api/orders/report"
//       );
//       setOrders(response.data.orders);
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//       setError(error.response?.data?.message || error.message);
//       setLoading(false);
//     }
//   };

//   const handleSearchChange = (event) => {
//     setSearchQuery(event.target.value);
//   };

//   // Expand the orders data to have one row per product
//   const processedData = orders.flatMap((order) => {
//     return order.products.map((product) => {
//       return {
//         "Customer Name": `${order.firstName} ${order.lastName}`,
//         "Phone Number": order.phoneNumber,
//         Email: order.email,
//         "County to Deliver": order.county,
//         "Location Description": order.description,
//         "Product Name": product.productName,
//         Quantity: product.quantity,
//         "Order Status": order.status,
//         "Customer Feedback": order.feedback || "No feedback",
//         "Order Date": new Date(order.createdAt).toLocaleDateString(),
//       };
//     });
//   });

//   // Filter data based on search query
//   const filteredData = processedData.filter((order) => {
//     return Object.values(order).some(
//       (value) =>
//         value &&
//         value.toString().toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   });

//   return (
//     <div className="ordersContainer">
//       <div className="title">ORDERS REPORT</div>
//       <div className="search-bar">
//         <input
//           type="text"
//           placeholder="Search..."
//           value={searchQuery}
//           onChange={handleSearchChange}
//         />
//       </div>

//       {loading && (
//         <div className="loadingContainer">
//           <ThreeDots
//             height="80"
//             width="80"
//             radius="9"
//             color="#3498db"
//             ariaLabel="three-dots-loading"
//           />
//           <div className="loadingMessage">Loading...</div>
//         </div>
//       )}

//       {error && <div className="errorMessage">Error: {error}</div>}

//       {!loading &&
//         !error &&
//         (filteredData.length > 0 ? (
//           <Table columns={columns} data={filteredData} />
//         ) : (
//           <div className="noOrders">No orders found</div>
//         ))}
//     </div>
//   );
// }

// export default Orders;
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
        "http://localhost:5000/api/orders/report"
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