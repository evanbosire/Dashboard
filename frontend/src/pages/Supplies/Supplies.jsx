import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSupplies } from "../../redux/actions/suppliesActions";
import Table from "../../components/Table/Table";
import { ThreeDots } from "react-loader-spinner"; // Import the spinner
import "./supplies.scss";
import { useNavigate } from "react-router-dom";

const columns = [
  "id",
  "ProductName",
  "Requested Qty(Pcs)",
  "SupplingPrice",
  "Supplier",
  "Status",
  "Date",
  "Requested On",
  "PaymentStatus",
  "TotalPrice",
];

function Supplies() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { supplies, loading, error } = useSelector((state) => state.supplies);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let email = sessionStorage.getItem("email");
    if (email === "" || email === null) {
      navigate("/login");
    } else {
      dispatch(fetchSupplies());
    }
  }, [dispatch, navigate]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = supplies.filter((item) =>
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
        <div className="loadingMessage">Loading...</div>
      </div>
    );
  }

  if (error) {
    return <div className="errorMessage">Error: {error}</div>;
  }

  return (
    <div className="suppliesContainer">
      <div className="title">RAW MATERIALS SUPPLIES REPORT</div>
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
        <div>No supplies available.</div>
      )}
    </div>
  );
}

export default Supplies;
