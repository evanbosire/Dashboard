// src/pages/Servicesoffered/Servicesoffered.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Table from "../../components/Table/Table";
import { ThreeDots } from "react-loader-spinner";
import "./servicesoffered.scss";

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
];

function Servicesoffered() {
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

  // Fetch services offered from the API
  const fetchServicesOffered = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/services/offered-report"
      );
      setServicesOffered(response.data.services);
    } catch (error) {
      console.error("Error fetching services offered:", error);
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
    "Customer Name": item.customerName || "N/A", // Customer Name
    "Location to Render Service": item.location || "N/A", // Location to Render Service
    "Location Description": item.description || "N/A", // Location Description
    "Iron Sheet to Paint": item.ironSheetType || "N/A", // Iron Sheet to Paint
    "Color to Paint": item.color || "N/A", // Color to Paint
    "Thickness of Iron Sheets": item.gauge || "N/A", // Thickness of Iron Sheets
    "No. of Sheets to Paint": item.numberOfSheets || "N/A", // No. of Sheets to Paint
    "Booked Date": new Date(item.createdAt).toLocaleDateString(), // Booked Date (formatted)
    "Painter Name": item.renderedBy // Painter Name
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
    <div className="servicesofferedContainer">
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
          <div className="title">SERVICE OFFERED REPORT</div>
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
export default Servicesoffered;