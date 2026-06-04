import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo1 from "./assets/logo1.png";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
      const res = await fetch("https://coffee-shop-system-q5ow.onrender.com/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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

      if (data.message === "Login success") {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("user_id", data.user.user_id);

        setUser(data.user);
        navigate("/home");
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
