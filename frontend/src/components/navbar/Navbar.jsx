import React from "react";
import "./navbar.scss";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";

function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();

  const LogOut = () => {
    navigate("/login");
  };
  return (
    <div className="navbar">
      <div className="navbarContainer">
        <MenuIcon className="menu-icon" onClick={toggleSidebar} />
        <div className="labelContainer">
          <img src={logo} alt="My Logo" className="navbar-logo" />
          <div className="textContainer">
            <span>CORRUGATED SHEETS LIMITED</span>
            <span>ADMINISTRATOR DASHBOARD</span>
          </div>
        </div>

        <div onClick={LogOut} className="myprofile">
          <LogoutIcon />
          <span>Log Out</span>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
