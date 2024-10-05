import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "../../components/Table/Table";
import { useNavigate } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner"; // Import the spinner
import "./rejected.scss";

const columns = ["_id", "customerName", "gender", "phone", "email", "location"];

function Rejected() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          "https://dashboard-76od.onrender.com/api/customers/rejected"
        );
        setCustomers(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    fetchCustomers();

    const email = sessionStorage.getItem("email");
    if (!email) {
      navigate("/login");
    }
  }, [navigate]);

  const handlePending = async (id) => {
    try {
      await axios.patch(
        `https://dashboard-76od.onrender.com/api/customers/revert/${id}`
      );
      setCustomers(customers.filter((customer) => customer._id !== id));
    } catch (error) {
      console.error("Error reverting customer:", error);
    }
  };

  const actions = [
    {
      label: "Pending",
      onClick: handlePending,
    },
  ];

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = customers.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="rejectedContainer">
      {loading ? (
        <div className="loaderContainer">
          <ThreeDots
            height="40"
            width="80"
            radius="9"
            color="#3498db"
            ariaLabel="three-dots-loading"
          />
          <div className="loadingMessage">Loading...</div>
        </div>
      ) : (
        <>
          <div className="title">REJECTED CUSTOMERS</div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <Table columns={columns} data={filteredData} actions={actions} />
        </>
      )}
    </div>
  );
}

export default Rejected;
