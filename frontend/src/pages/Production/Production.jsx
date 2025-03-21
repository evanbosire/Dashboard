import React, { useEffect, useState } from "react";
import "./production.scss";
import Table from "../../components/Table/Table";
import { useNavigate } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";

// Define columns based on the API response structure
const columns = [
  "productName",
  "description",
  "quantity",
  "units",
  "status",
  "allocatedTo",
  "createdAt",
  "productStockQuantity",
  "productUpdatedAt",
];

function Production() {
  const navigate = useNavigate();
  const [productionData, setProductionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const email = sessionStorage.getItem("email");
    if (!email) {
      navigate("/login");
    } else {
      fetchProductionData();
    }
  }, [navigate]);

  const fetchProductionData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://backend-n0lb.onrender.com/api/production-reports"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Format dates for better display
      const formattedData = data.productionReports.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt).toLocaleDateString(),
        productUpdatedAt: item.productUpdatedAt
          ? new Date(item.productUpdatedAt).toLocaleDateString()
          : "N/A",
      }));

      setProductionData(formattedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching production data:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = productionData.filter((item) =>
    Object.values(item).some(
      (value) =>
        value &&
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
        <div className="loadingMessage">Loading...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

  return (
    <div className="productionContainer">
      <div className="title">PRODUCTION REPORT</div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      {filteredData.length > 0 ? (
        <Table columns={columns} data={filteredData} />
      ) : (
        <div className="no-data">No production data available.</div>
      )}
    </div>
  );
}

export default Production;
