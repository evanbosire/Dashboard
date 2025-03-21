// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchSupplies } from "../../redux/actions/suppliesActions";
// import Table from "../../components/Table/Table";
// import { ThreeDots } from "react-loader-spinner"; // Import the spinner
// import "./supplies.scss";
// import { useNavigate } from "react-router-dom";

// const columns = [
//   "id",
//   "ProductName",
//   "Requested Qty(Pcs)",
//   "SupplingPrice",
//   "Supplier",
//   "Status",
//   "Date",
//   "Requested On",
//   "PaymentStatus",
//   "TotalPrice",
// ];

// function Supplies() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { supplies, loading, error } = useSelector((state) => state.supplies);
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     let email = sessionStorage.getItem("email");
//     if (email === "" || email === null) {
//       navigate("/login");
//     } else {
//       dispatch(fetchSupplies());
//     }
//   }, [dispatch, navigate]);

//   const handleSearchChange = (event) => {
//     setSearchQuery(event.target.value);
//   };

//   const filteredData = supplies.filter((item) =>
//     Object.values(item).some((value) =>
//       value.toString().toLowerCase().includes(searchQuery.toLowerCase())
//     )
//   );

//   if (loading) {
//     return (
//       <div className="loadingContainer">
//         <ThreeDots
//           height="80"
//           width="80"
//           radius="9"
//           color="#3498db"
//           ariaLabel="three-dots-loading"
//         />
//         <div className="loadingMessage">Loading...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return <div className="errorMessage">Error: {error}</div>;
//   }

//   return (
//     <div className="suppliesContainer">
//       <div className="title">RAW MATERIALS SUPPLIES REPORT</div>
//       <div className="search-bar">
//         <input
//           type="text"
//           placeholder="Search..."
//           value={searchQuery}
//           onChange={handleSearchChange}
//         />
//       </div>
//       {filteredData.length > 0 ? (
//         <Table columns={columns} data={filteredData} />
//       ) : (
//         <div>No supplies available.</div>
//       )}
//     </div>
//   );
// }

// export default Supplies;

import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "../../components/Table/Table";
import { ThreeDots } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import "./supplies.scss";

const columns = [
  "Product Name",
  "Requested Quantity",
  "Unit",
  "Supplier",
  "Supply Status",
  "Delivery Date",
  "Requested On",
  "Cost Per Unit",
  "Total Cost",
  "Payment Status",
  "Requested By",
  "Remarks",
];

function Supplies() {
  const navigate = useNavigate();
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSupplies = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/supply-details/report"
        );
        const supplyData = response.data.supplyDetails || [];
        setSupplies(supplyData);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch supplies data"
        );
      } finally {
        setLoading(false);
      }
    };

    let email = sessionStorage.getItem("email");
    if (email === "" || email === null) {
      navigate("/login");
    } else {
      fetchSupplies();
    }
  }, [navigate]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Transform the data to match the table columns
  const transformedData = supplies.map((supply) => {
    return {
      "Product Name": supply.material || "N/A",
      "Requested Quantity": `${supply.requestedQuantity || 0} ${
        supply.unit || "pcs"
      }`,
      Unit: supply.unit || "N/A",
      Supplier: supply.supplier || "N/A",
      "Supply Status": supply.status || "N/A",
      "Delivery Date": supply.deliveryDate
        ? new Date(supply.deliveryDate).toLocaleDateString()
        : "N/A",
      "Requested On": supply.dateRequested
        ? new Date(supply.dateRequested).toLocaleDateString()
        : "N/A",
      "Cost Per Unit": supply.costPerUnit
        ? `KSh ${supply.costPerUnit.toLocaleString()}`
        : "N/A",
      "Total Cost": supply.cost ? `KSh ${supply.cost.toLocaleString()}` : "N/A",
      "Payment Status": supply.paymentStatus || "N/A",
      "Requested By": supply.requestedBy || "N/A",
      Remarks: supply.remarks || "N/A",
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
        <div className="loadingMessage">Loading supplies data...</div>
      </div>
    );
  }

  if (error) {
    return <div className="errorMessage">⚠️ Error: {error}</div>;
  }

  return (
    <div className="suppliesContainer">
      <div className="title">RAW MATERIALS SUPPLIES REPORT</div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search supplies..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      {filteredData.length > 0 ? (
        <Table columns={columns} data={filteredData} />
      ) : (
        <div className="noDataMessage">No supplies data available.</div>
      )}
    </div>
  );
}

export default Supplies;