import React, { useState, useEffect } from "react";
import Table from "../../components/Table/Table";
import { ThreeDots } from "react-loader-spinner";
import "./shipments.scss";

// Define columns based on the API response structure with "email" renamed to "Customer Email"
const columns = [
  "orderId",
  "productDetails",
  "firstName",
  "lastName",
  "phoneNumber",
  "Customer Email",
  "driverName",
  "status",
];

function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Fetch shipments from the API directly
    const fetchShipments = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://backend-n0lb.onrender.com/api/shipment-reports"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setShipments(data.shipmentReports);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching shipment data:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Format product details to display in a readable format
  const formatProductDetails = (products) => {
    if (!products || products.length === 0) return "";
    return products.map((p) => `${p.productName} (${p.quantity})`).join(", ");
  };

  // Process data to format it for display
  const processedData = shipments.map((item) => ({
    ...item,
    productDetails: formatProductDetails(item.products),
    "Customer Email": item.email, // Map the email field to "Customer Email"
  }));

  // Filter data based on search query
  const filteredData = processedData.filter((item) =>
    Object.values(item).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="loading-container">
        <ThreeDots
          height="80"
          width="80"
          radius="9"
          color="#4fa94d"
          ariaLabel="loading"
          visible={true}
        />
      </div>
    );
  }

  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

  return (
    <div className="shipments-container">
      <h1 className="title">CUSTOMER DELIVERY REPORT</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search shipments..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {filteredData.length > 0 ? (
        <Table columns={columns} data={filteredData} />
      ) : (
        <div className="no-data">No shipments available.</div>
      )}
    </div>
  );
}

export default Shipments;