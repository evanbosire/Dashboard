import React, { useEffect, useState } from "react";
import "./production.scss";
import Table from "../../components/Table/Table";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductionData } from "../../redux/actions/productionActions";
import { useNavigate } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner"; // Import the spinner

const columns = ["product", "description", "quantity", "dateManufactured"];

function Production() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productionData, loading } = useSelector((state) => state.production);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const email = sessionStorage.getItem("email");
    if (!email) {
      navigate("/login");
    } else {
      dispatch(fetchProductionData()); // Fetch production data from API
    }
  }, [dispatch, navigate]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = productionData.filter((item) =>
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
      <Table columns={columns} data={filteredData} />
    </div>
  );
}

export default Production;
