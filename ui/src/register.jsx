import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo1 from "./assets/logo1.png";
const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm_password) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(`${VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.log("Server response not JSON:", text);
        setMessage("Server error");
        return;
      }

      setMessage(data.message);

      if (data.message === "Registration successful") {
        setTimeout(() => navigate("/login"), 1000);
      }
    } catch (error) {
      console.log(error);
      setMessage("Cannot connect to server");
    }
  };

  return (
    <div className="page">
      <div className="shader"></div>

      <div className="logointromod">
        <img className="logointro" src={logo1} alt="logo" />

        <div className="register-box">
          <h2 className="register-title">Register</h2>

          {message && <div className="msg">{message}</div>}

          <form onSubmit={handleSubmit}>
            <input
              name="username"
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <input
              name="confirm_password"
              type="password"
              placeholder="Confirm Password"
              value={form.confirm_password}
              onChange={handleChange}
              required
            />

            <input type="submit" value="Register" />
          </form>

          <Link to="/login">Already have an account?</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;