import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchShipments } from "../../redux/actions/shipmentsActions";
import Table from "../../components/Table/Table";
import { ThreeDots } from "react-loader-spinner"; // Import the spinner
import "./shipments.scss";

const columns = [
  "id",
  "customerName",
  "productDetails",
  "AmountPaid",
  "DeliveryFee",
  "DatePaid",
  "TransactionCode",
  "PaymentStatus",
  "LocationDetails",
  "ShippingStatus",
  "ShipperDetails",
  "CustomerFeedback",
];

function Shipments() {
  const dispatch = useDispatch();
  const { shipments, loading, error } = useSelector((state) => state.shipments);

  useEffect(() => {
    dispatch(fetchShipments()); // Fetch shipments when the component mounts
  }, [dispatch]);

  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const formatShipperDetails = (details) => {
    if (details) {
      return `${details.driverName}, ${details.Email}, ${details.Phone}`;
    }
    return "";
  };

  const processedData = shipments.map((item) => ({
    ...item,
    ShipperDetails: formatShipperDetails(item.ShipperDetails),
  }));

  const filteredData = processedData.filter((item) =>
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
    <div className="shipmentsContainer">
      <div className="title">CUSTOMER DELIVERY REPORT</div>
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
        <div>No shipments available.</div>
      )}
    </div>
  );
}

export default Shipments;
