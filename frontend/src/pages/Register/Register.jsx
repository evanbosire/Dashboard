import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Register.scss"; // Import your CSS file
import logo from "../../assets/images/logo.png";

function Register() {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const navigate = useNavigate();

  const IsValidate = () => {
    let isproceed = true;
    let errormessage = "Please enter the value in ";

    // Validate each field and append error messages
    if (id.trim() === "") {
      isproceed = false;
      errormessage += " Username";
    }
    if (name.trim() === "") {
      isproceed = false;
      errormessage += " Fullname";
    }
    if (password.trim() === "") {
      isproceed = false;
      errormessage += " Password";
    }

    // Remove trailing comma and space from error message
    if (!isproceed) {
      errormessage = errormessage.slice(0, -2); // Remove the trailing ", "
      toast.warning(errormessage);
    } else {
      if (/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/.test(email)) {
      } else {
        isproceed = false;
        toast.warning("Please enter a valid email");
      }
    }

    return isproceed;
  };

  const handlesubmit = async (e) => {
    e.preventDefault();
    if (IsValidate()) {
      const regobj = { id, name, email, password, phone };

      try {
        // Send request to the MongoDB backend to register an admin
        const response = await fetch(
          "https://dashboard-76od.onrender.com/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(regobj),
          }
        );

        const data = await response.json();

        if (response.ok) {
          toast.success("Registered Successfully");
          navigate("/login");
        } else {
          throw new Error(data.message || "Registration failed");
        }
      } catch (err) {
        toast.error("Failed: " + err.message);
      }
    }
  };

  return (
    <div className="register-page">
      <div className="register-form-container">
        <form className="container" onSubmit={handlesubmit}>
          <div className="card">
            <div className="card-header" style={{ textAlign: "center" }}>
              <img src={logo} alt="My Logo" className="navbar-logo" />
              <h1 className="colors">ADMINISTRATOR REGISTRATION</h1>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-lg-6">
                  <div className="form-group">
                    <label className="colors">
                      User Name <span className="errmsg">*</span>
                    </label>
                    <input
                      value={id}
                      onChange={(e) => setId(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label className="colors">
                      Full Name <span className="errmsg">*</span>
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label className="colors">
                      Email <span className="errmsg">*</span>
                    </label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label className="colors">
                      Password <span className="errmsg">*</span>
                    </label>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label className="colors">
                      Phone Number <span className="errmsg">*</span>
                    </label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <button type="submit" className="btn btn-primary">
                Register
              </button>{" "}
              |
              <a className="btn btn-danger" href="/login">
                Login
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
