import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo1 from "./assets/logo1.png";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
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

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setMessage(data.message);

      if (data.message === "Login success") {
        navigate("/");
      }
    } catch (error) {
      setMessage("Server error. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="page">
      <div className="shader"></div>

      <div className="logointromod">
        <img className="logointro" src={logo1} alt="logo" />

        <div className="register-box">

          <h2 className="register-title">Login</h2>

          {message && <div className="msg">{message}</div>}

          <form onSubmit={handleSubmit}>
            <input
              name="username"
              type="text"
              placeholder="Username"
              onChange={handleChange}
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />

            <input type="submit" value="Login" />
          </form>

          <Link to="/register">Don't have an account?</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;