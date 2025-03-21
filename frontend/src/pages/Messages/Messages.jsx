// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { fetchMessagesData } from "../../redux/actions/messagesActions";
// import Table from "../../components/Table/Table";
// import { ThreeDots } from "react-loader-spinner"; // Import the spinner
// import "./messages.scss";

// const columns = [
//   "_id",
//   "Sender",
//   "Message",
//   "Date",
//   "Recipient",
//   "Reply",
//   "ReplyDate",
// ];

// function Messages() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { messagesData, loading } = useSelector((state) => state.messages);

//   useEffect(() => {
//     const email = sessionStorage.getItem("email");
//     if (!email) {
//       navigate("/login");
//     } else {
//       dispatch(fetchMessagesData());
//     }
//   }, [dispatch, navigate]);

//   const [searchQuery, setSearchQuery] = React.useState("");

//   const handleSearchChange = (event) => {
//     setSearchQuery(event.target.value);
//   };

//   const filteredData = messagesData.filter((item) =>
//     Object.values(item).some((value) =>
//       value.toString().toLowerCase().includes(searchQuery.toLowerCase())
//     )
//   );

//   return (
//     <div className="messagesContainer">
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
//           <div className="title">MESSAGES REPORT</div>
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

// export default Messages;
// src/pages/MessagesReport/MessagesReport.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Table from "../../components/Table/Table";
import { ThreeDots } from "react-loader-spinner";
import "./messages.scss";

const columns = [
  "Sender",
  "Receiver",
  "Message",
  "Customer Name",
  "Date and Time",
];

function MessagesReport() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const email = sessionStorage.getItem("email");
    if (!email) {
      navigate("/login");
    } else {
      fetchMessages();
    }
  }, [navigate]);

  // Fetch messages report from the API
  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/messages-report"
      );
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Error fetching messages report:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Pre-process data to match the column names
  const processedData = messages.map((item) => ({
    Sender: item.sender || "N/A",
    Receiver: item.receiver || "N/A",
    Message: item.message || "N/A",
    "Customer Name": item.customerName || "N/A",
    "Date and Time": new Date(item.timestamp).toLocaleString(),
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
    <div className="messagesReportContainer">
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
          <div className="title">MESSAGES REPORT</div>
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

export default MessagesReport;
