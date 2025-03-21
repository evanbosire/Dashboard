import React, { useState } from "react";
import "./sidebar.scss";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import Person3Icon from "@mui/icons-material/Person3";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { BsChevronRight, BsChevronDown } from "react-icons/bs";
import { Link } from "react-router-dom";

function Sidebar({ isOpen, setIsSidebarOpen }) {
  const [isCustomersOpen, setCustomersOpen] = useState(false);
  const [isEmployeesOpen, setEmployeesOpen] = useState(false);
  const [isReportsOpen, setReportsOpen] = useState(false);

  const toggleCustomers = () => setCustomersOpen(!isCustomersOpen);
  const toggleEmployees = () => setEmployeesOpen(!isEmployeesOpen);
  const toggleReports = () => setReportsOpen(!isReportsOpen);

  const handleLinkClick = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className={`sidebarContainer ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar">
        <ul>
          <Link
            to={"/Dashboard"}
            className="custom-link"
            onClick={handleLinkClick}
          >
            <li>
              <DashboardIcon className="icon" />
              <span>Dashboard</span>
            </li>
          </Link>
          <li onClick={toggleCustomers} className="menu-item">
            <PeopleIcon className="icon" />
            <span>Customers</span>
            {isCustomersOpen ? (
              <BsChevronDown className="chevron" />
            ) : (
              <BsChevronRight className="chevron" />
            )}
          </li>
          {isCustomersOpen && (
            <ul className="submenu">
              <Link
                to={"/Pending"}
                className="custom-link"
                onClick={handleLinkClick}
              >
                <li>Pending</li>
              </Link>
              <Link
                to={"/Active"}
                className="custom-link"
                onClick={handleLinkClick}
              >
                <li>Active</li>
              </Link>
              <Link
                to={"/Suspended"}
                className="custom-link"
                onClick={handleLinkClick}
              >
                <li>Suspended</li>
              </Link>
              <Link
                to={"/Rejected"}
                className="custom-link"
                onClick={handleLinkClick}
              >
                <li>Rejected</li>
              </Link>
            </ul>
          )}
          <li onClick={toggleEmployees} className="menu-item">
            <Person3Icon className="icon" />
            <span>Employees</span>
            {isEmployeesOpen ? (
              <BsChevronDown className="chevron" />
            ) : (
              <BsChevronRight className="chevron" />
            )}
          </li>
          {isEmployeesOpen && (
            <ul className="submenu">
              <Link
                to={"/activeemployee"}
                className="custom-link"
                onClick={handleLinkClick}
              >
                <li>Active</li>
              </Link>
              <Link
                to={"/inactiveemployee"}
                className="custom-link"
                onClick={handleLinkClick}
              >
                <li>Inactive</li>
              </Link>
            </ul>
          )}
          <Link
            to={"/addstaff"}
            className="custom-link"
            onClick={handleLinkClick}
          >
            <li>
              <AddCircleIcon className="icon" />
              <span>Add Employees</span>
              <BsChevronRight className="chevron" />
            </li>
          </Link>
          <li onClick={toggleReports} className="menu-item">
            <MenuBookIcon className="icon" />
            <span>All Reports</span>
            {isReportsOpen ? (
              <BsChevronDown className="chevron" />
            ) : (
              <BsChevronRight className="chevron" />
            )}
          </li>
          {isReportsOpen && (
            <ul className="submenu">
              <Link
                to={"/orders"}
                className="custom-link"
                onClick={handleLinkClick}
              >
                <li>Orders</li>
              </Link>
              <Link
                to={"/payments"}
                className="custom-link"
                onClick={handleLinkClick}
              >
                <li>Payments</li>
              </Link>
              <Link
                to={"/shipments"}
                className="custom-link"
                onClick={handleLinkClick}
              >
                <li>Shippments</li>
              </Link>
              <Link
                to={"/supplies"}
                className="custom-link"
                onClick={handleLinkClick}
              >
                <li>Supplies</li>
              </Link>
              
              <Link
                to={"/servicesoffered"}
                className="custom-link"
                onClick={handleLinkClick}
              >
                <li>Services Offered</li>
              </Link>
              <Link
                to={"/servicespayment"}
                className="custom-link"
                onClick={handleLinkClick}
              >
                <li>Services Payment</li>
              </Link>
              <Link
                to={"/messages"}
                className="custom-link"
                onClick={handleLinkClick}
              >
                <li>Messages Reports</li>
              </Link>
              <Link
                to={"/production"}
                className="custom-link"
                onClick={handleLinkClick}
              >
                <li>Production Reports</li>
              </Link>
            </ul>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
