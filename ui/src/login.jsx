import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo1 from "./assets/logo1.png";

function Login({ setUser }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
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

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // send as "username" since authController reads req.body.username
        body: JSON.stringify({
          username: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();
      setMessage(data.message);

      if (data.message === "Login success") {
        // SAVE USER + user_id to localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("user_id", data.user.user_id);

        setUser(data.user);
        navigate("/home");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server error. Please try again.");
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

            <input type="submit" value="LOGIN" />
          </form>

          <Link to="/register">Don't have an account?</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
