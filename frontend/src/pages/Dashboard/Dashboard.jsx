// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchCustomerCounts,
//   updateCountsFromSSE,
// } from "../../redux/slices/customerCountsSlice";
// import { fetchProductionData } from "../../redux/actions/productionActions";
// import { BsPeople } from "react-icons/bs";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   Cell,
// } from "recharts";
// import { ThreeDots } from "react-loader-spinner"; // Import the spinner
// import "./dashboard.scss";
// import { useNavigate } from "react-router-dom";

// function Dashboard() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { pending, active, suspended, rejected, status } = useSelector(
//     (state) => state.customerCounts
//   );
//   const { productionData } = useSelector((state) => state.production);

//   useEffect(() => {
//     if (status === "idle") {
//       dispatch(fetchCustomerCounts());
//     }

//     const email = sessionStorage.getItem("email");
//     if (!email) {
//       navigate("/login");
//     }

//     dispatch(fetchProductionData()); // Fetch production data from API

//     const eventSource = new EventSource(
//       "https://backend-n0lb.onrender.com/events"
//     );
//     eventSource.onmessage = (event) => {
//       const message = JSON.parse(event.data);
//       dispatch(updateCountsFromSSE(message));
//     };

//     return () => eventSource.close();
//   }, [dispatch, navigate, status]);

//   const colorMapping = {
//     "Aluminum Roofing Sheets": "#848789",
//     "Pre-painted Roofing Sheets": "#701A75",
//     "Hollow Sections": "#E11D48",
//     Tubes: "#0000FF",
//     "Wire Products": "#6EE7B7",
//     "Bitumen Products": "#FACC15",
//     Plates: "#C026D3",
//   };

//   const chartData = productionData.map((item) => ({
//     name: item.product,
//     uv: item.quantity,
//     color: colorMapping[item.product] || "#67E8F9",
//   }));

//   return (
//     <div className="main-container">
//       {status === "loading" || !productionData ? (
//         <div className="loaderContainer">
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
//           <div className="main-title">
//             <h3>DASHBOARD</h3>
//           </div>
//           <div className="main-cards">
//             <div className="card">
//               <div className="card-inner">
//                 <h3>PENDING CUSTOMERS</h3>
//                 <BsPeople className="card_icon" />
//               </div>
//               <h1 className="number">{pending}</h1>
//             </div>

//             <div className="card">
//               <div className="card-inner">
//                 <h3>ACTIVE CUSTOMERS</h3>
//                 <BsPeople className="card_icon" />
//               </div>
//               <h1 className="number">{active}</h1>
//             </div>

//             <div className="card">
//               <div className="card-inner">
//                 <h3>SUSPENDED CUSTOMERS</h3>
//                 <BsPeople className="card_icon" />
//               </div>
//               <h1 className="number">{suspended}</h1>
//             </div>

//             <div className="card">
//               <div className="card-inner">
//                 <h3>REJECTED CUSTOMERS</h3>
//                 <BsPeople className="card_icon" />
//               </div>
//               <h1 className="number">{rejected}</h1>
//             </div>
//           </div>

//           <div className="chart-titles">PRODUCTION BAR & LINE CHARTS</div>
//           <div className="barChart" style={{ marginTop: "20px" }}>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart
//                 width={500}
//                 height={300}
//                 data={chartData}
//                 margin={{ top: 20, right: 30, left: 20, bottom: 3 }} // Increased top margin
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis
//                   dataKey="name"
//                   label={{
//                     value: "PRODUCT",
//                     position: "insideBottomRight",
//                     offset: 0,
//                   }}
//                 />
//                 <YAxis
//                   label={{
//                     value: "QTY (TONNES)",
//                     angle: -90,
//                     position: "insideLeft",
//                     offset: 0,
//                   }}
//                 />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="uv" barSize={60}>
//                   {chartData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart
//                 width={500}
//                 height={300}
//                 data={chartData}
//                 margin={{ top: 20, right: 30, left: 20, bottom: 5 }} // Increased top margin
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis
//                   dataKey="name"
//                   label={{
//                     value: "PRODUCT",
//                     position: "insideBottomRight",
//                     offset: 0,
//                   }}
//                 />
//                 <YAxis
//                   label={{
//                     value: "QTY (TONNES)",
//                     angle: -90,
//                     position: "insideLeft",
//                     offset: 0,
//                   }}
//                 />
//                 <Tooltip />
//                 <Legend />
//                 <Line
//                   type="monotone"
//                   dataKey="uv"
//                   stroke="#8884d8"
//                   activeDot={{ r: 8 }}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// export default Dashboard;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { BsPeople } from "react-icons/bs";
import { ThreeDots } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import "./dashboard.scss";

function Dashboard() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(0);
  const [active, setActive] = useState(0);
  const [suspended, setSuspended] = useState(0);
  const [rejected, setRejected] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = sessionStorage.getItem("email");
    if (!email) {
      navigate("/login");
    }

    const fetchCustomerCounts = async () => {
      try {
        const pendingResponse = await axios.get(
          "https://backend-n0lb.onrender.com/api/customers/counts/pending"
        );
        const activeResponse = await axios.get(
          "https://backend-n0lb.onrender.com/api/customers/counts/active"
        );
        const suspendedResponse = await axios.get(
          "https://backend-n0lb.onrender.com/api/customers/counts/suspended"
        );
        const rejectedResponse = await axios.get(
          "https://backend-n0lb.onrender.com/api/customers/counts/rejected"
        );

        setPending(pendingResponse.data.count);
        setActive(activeResponse.data.count);
        setSuspended(suspendedResponse.data.count);
        setRejected(rejectedResponse.data.count);
      } catch (error) {
        console.error("Error fetching customer counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerCounts();
  }, [navigate]);

  return (
    <div className="main-container">
      {loading ? (
        <div className="loaderContainer">
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
          <div className="main-title">
            <h3>DASHBOARD</h3>
          </div>
          <div className="main-cards">
            <div className="card card-pending">
              <div className="card-inner">
                <h3>PENDING CUSTOMERS</h3>
                <BsPeople className="card_icon" />
              </div>
              <h1 className="number">{pending}</h1>
            </div>

            <div className="card card-active">
              <div className="card-inner">
                <h3>ACTIVE CUSTOMERS</h3>
                <BsPeople className="card_icon" />
              </div>
              <h1 className="number">{active}</h1>
            </div>

            <div className="card card-suspended">
              <div className="card-inner">
                <h3>SUSPENDED CUSTOMERS</h3>
                <BsPeople className="card_icon" />
              </div>
              <h1 className="number">{suspended}</h1>
            </div>

            <div className="card card-rejected">
              <div className="card-inner">
                <h3>REJECTED CUSTOMERS</h3>
                <BsPeople className="card_icon" />
              </div>
              <h1 className="number">{rejected}</h1>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
