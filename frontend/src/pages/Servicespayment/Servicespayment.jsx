// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { fetchServicesPayment } from "../../redux/actions/servicespaymentActions";
// import Table from "../../components/Table/Table";
// import { ThreeDots } from "react-loader-spinner"; // Import the spinner
// import "./servicespayment.scss";

// const columns = [
//   "_id",
//   "customerDetails",
//   "Location",
//   "ServiceName",
//   "BookingDate",
//   "ServicingDate",
//   "AmountPaid",
//   "PaymentDate",
//   "PaymentStatus",
// ];

// function Servicespayment() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { servicesPayments, loading } = useSelector(
//     (state) => state.servicesPayments
//   );
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     const email = sessionStorage.getItem("email");
//     if (!email) {
//       navigate("/login");
//     } else {
//       dispatch(fetchServicesPayment()); // Fetch data from the backend
//     }
//   }, [dispatch, navigate]);

//   const handleSearchChange = (event) => {
//     setSearchQuery(event.target.value);
//   };

//   const formatCustomerDetails = (details) => {
//     if (details) {
//       return `Customer Name: ${details.driverName}\n , Email: ${details.Email}\n, Phone: ${details.Phone}`;
//     }
//     return "";
//   };

//   const processedData = servicesPayments.map((item) => ({
//     ...item,
//     customerDetails: formatCustomerDetails(item.customerDetails),
//   }));

//   const filteredData = processedData.filter((item) =>
//     Object.values(item).some((value) =>
//       value.toString().toLowerCase().includes(searchQuery.toLowerCase())
//     )
//   );

//   return (
//     <div className="servicespaymentContainer">
//       {loading ? (
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
//       ) : (
//         <>
//           <div className="title">SERVICE PAYMENT REPORT</div>
//           <div className="search-bar">
//             <input
//               type="text"
//               placeholder="Search..."
//               value={searchQuery}
//               onChange={handleSearchChange}
//             />
//           </div>
//           <Table columns={columns} data={filteredData} />
//         </>
//       )}
//     </div>
//   );
// }

// export default Servicespayment;

// src/pages/Servicespayment/Servicespayment.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Table from "../../components/Table/Table";
import { ThreeDots } from "react-loader-spinner";
import "./servicespayment.scss"; // Updated import for styles

const columns = [
  "Customer Name", // customerName
  "Location to Render Service", // location
  "Location Description", // description
  "Iron Sheet to Paint", // ironSheetType
  "Color to Paint", // color
  "Thickness of Iron Sheets", // gauge
  "No. of Sheets to Paint", // numberOfSheets
  "Booked Date", // createdAt
  "Painter Name", // renderedBy
  "Payment Method", // paymentMethod
  "Payment Code", // paymentCode
  "Price Per Sheet", // pricePerSheet
  "Total Price", // totalPrice
];

function Servicespayment() { // Renamed component
  const navigate = useNavigate();
  const [servicesOffered, setServicesOffered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const email = sessionStorage.getItem("email");
    if (!email) {
      navigate("/login");
    } else {
      fetchServicesOffered();
    }
  }, [navigate]);

  // Fetch services payment report from the API
  const fetchServicesOffered = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/services/payment-report"
      );
      setServicesOffered(response.data.services);
    } catch (error) {
      console.error("Error fetching services payment report:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  // Pre-process data to match the column names and format fields
  const processedData = servicesOffered.map((item) => ({
    "Customer Name": item.customerName || "N/A",
    "Location to Render Service": item.location || "N/A",
    "Location Description": item.description || "N/A",
    "Iron Sheet to Paint": item.ironSheetType || "N/A",
    "Color to Paint": item.color || "N/A",
    "Thickness of Iron Sheets": item.gauge || "N/A",
    "No. of Sheets to Paint": item.numberOfSheets || "N/A",
    "Booked Date": new Date(item.createdAt).toLocaleDateString(),
    "Painter Name": item.renderedBy,
    "Payment Method": item.paymentMethod || "N/A",
    "Payment Code": item.paymentCode || "N/A",
    "Price Per Sheet": item.pricePerSheet || "N/A",
    "Total Price": item.totalPrice || "N/A",
  }));

  // Filter data based on search query
  const filteredData = processedData.filter((item) =>
    Object.values(item).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="servicespaymentContainer"> {/* Updated class name */}
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
          <div className="title">SERVICE PAYMENT REPORT</div>
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

export default Servicespayment; // Updated export
