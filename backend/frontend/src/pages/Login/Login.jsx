import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Login.scss";
import logo from "../../assets/images/logo.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate(); // Correctly call useNavigate here

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  const ProceedLogin = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        // Send login request to MongoDB backend
        const response = await fetch(
          "https://dashboard-76od.onrender.com/api/admin/login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          toast.success("Login successful!");
          sessionStorage.setItem("email", email); // Store the email in session
          navigate("/dashboard"); // Redirect to the dashboard
        } else {
          toast.error(data.message || "Invalid email or password.");
        }
      } catch (err) {
        toast.error("Login Failed: " + err.message);
      }
    }
  };

  const validate = () => {
    let result = true;
    if (email === "" || email === null) {
      result = false;
      toast.warning("Please Enter Email");
    }
    if (password === "" || password === null) {
      result = false;
      toast.warning("Please Enter Password");
    }
    return result;
  };

  return (
    <div className="login-page">
      <div className="login-form-container">
        <form onSubmit={ProceedLogin} className="login-form">
          <div className="card">
            <div className="card-header">
              <img src={logo} alt="My Logo" className="navbar-logo" />
              <h2 className="titles">
                <span>ADMINISTRATOR</span>
                <span>LOGIN</span>
              </h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="titles">
                  Email <span className="errmsg">*</span>
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                ></input>
              </div>
              <div className="form-group">
                <label className="titles">
                  Password <span className="errmsg">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                ></input>
              </div>
              <div className="card-footer">
                <button type="submit" className="btn btn-primary">
                  Login
                </button>{" "}
                |
                <Link className="btn btn-success" to={"/register"}>
                  SignUp
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
