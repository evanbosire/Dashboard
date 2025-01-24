import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRequestedMaterials } from "../../redux/actions/requestedActions";
import Table from "../../components/Table/Table";
import { ThreeDots } from "react-loader-spinner"; // Import the spinner
import "./requested.scss";
import { useNavigate } from "react-router-dom";

const columns = [
  "id",
  "material",
  "requestedQuantity",
  "description",
  "painter",
  "dateRequested",
  "status",
];

function Requested() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { requestedMaterials, loading } = useSelector(
    (state) => state.requested
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const email = sessionStorage.getItem("email");
    if (!email) {
      navigate("/login");
    } else {
      dispatch(fetchRequestedMaterials());
    }
  }, [dispatch, navigate]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = requestedMaterials.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="requestedContainer">
      {loading ? (
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
      ) : (
        <>
          <div className="title">REQUESTED MATERIALS REPORT</div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <Table columns={columns} data={filteredData} />
        </>
      )}
    </div>
  );
}

export default Requested;
