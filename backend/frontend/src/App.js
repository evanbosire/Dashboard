import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import Pending from "./pages/Pending/Pending";
import Active from "./pages/Active/Active";
import Suspended from "./pages/Suspended/Suspended";
import Rejected from "./pages/Rejected/Rejected";
import Activeemployee from "./pages/Activeemployee/Activeemployee";
import Inactiveemployee from "./pages/Inactiveemployee/Inactiveemployee";
import Addstaff from "./pages/Addstaff/Addstaff";
import Orders from "./pages/Orders/Orders";
import Payments from "./pages/Payments/Payments";
import Shipments from "./pages/Shipments/Shipments";
import Supplies from "./pages/Supplies/Supplies";
import Requested from "./pages/Requested/Requested";
import Servicesoffered from "./pages/Servicesoffered/Servicesoffered";
import Servicespayment from "./pages/Servicespayment/Servicespayment";
import Production from "./pages/Production/Production";
import Messages from "./pages/Messages/Messages";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import { ToastContainer } from "react-toastify";
import "./App.css";
import { useState } from "react";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Determine if the current path requires hiding the navbar and sidebar
  const hideNavbarSidebar =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="App">
      {/* Conditionally render Navbar and Sidebar */}
      {!hideNavbarSidebar && (
        <>
          <Navbar toggleSidebar={toggleSidebar} />
          <div className="main" style={{ display: "flex", width: "100%" }}>
            <Sidebar
              isOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />
            <div
              className="content"
              style={{
                flex: 1,
                marginLeft: isSidebarOpen ? "0" : "0",
                transition: "margin-left 0.3s ease",
              }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/pending" element={<Pending />} />
                <Route path="/active" element={<Active />} />
                <Route path="/suspended" element={<Suspended />} />
                <Route path="/rejected" element={<Rejected />} />
                <Route path="/activeemployee" element={<Activeemployee />} />
                <Route
                  path="/inactiveemployee"
                  element={<Inactiveemployee />}
                />
                <Route path="/addstaff" element={<Addstaff />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/shipments" element={<Shipments />} />
                <Route path="/supplies" element={<Supplies />} />
                <Route path="/requested" element={<Requested />} />
                <Route path="/servicesoffered" element={<Servicesoffered />} />
                <Route path="/servicespayment" element={<Servicespayment />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/production" element={<Production />} />
              </Routes>
            </div>
          </div>
        </>
      )}
      {hideNavbarSidebar && (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      )}
      <ToastContainer
        position="top-center" // Center horizontally at the top
        autoClose={5000} // Auto close after 5 seconds
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
