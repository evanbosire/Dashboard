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

  const ProceedLogin = (e) => {
    e.preventDefault();
    if (validate()) {
      fetch("http://localhost:3000/user")
        .then((res) => res.json())
        .then((users) => {
          // Find user with matching email and password
          const user = users.find(
            (u) => u.email === email && u.password === password
          );

          if (user) {
            toast.success("Login successful!");
            // Redirect to another page after successful login
            sessionStorage.setItem("email", email);
            navigate("/dashboard");
          } else {
            toast.error("Invalid email or password.");
          }
        })
        .catch((err) => {
          toast.error("Login Failed due to :" + err.message);
        });
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
