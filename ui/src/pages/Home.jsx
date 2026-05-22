import Navbar from "../components/Navbar";
import "./Home.css";
import Messenger from "../components/Messenger";
import { useNavigate } from "react-router-dom";

function Home({ setUser }) {
  const navigate = useNavigate();

  // Safely parse user and try all common id field names
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?.user_id || user?.id || user?.userId || null;

  console.log("Home.jsx — user object:", user);
  console.log("Home.jsx — resolved userId:", userId);

  return (
    <>
      <Navbar setUser={setUser} />

      <div className="hero">
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <h1>
            Brewed For <span>You</span>
          </h1>
          <p>Experience handcrafted coffee made with passion.</p>

          <button onClick={() => navigate("/products")}>
            Shop Now
          </button>
        </div>
      </div>

      {/* 💬 MESSENGER WIDGET — only renders when userId is available */}
      {userId ? (
        <Messenger userId={userId} />
      ) : (
        <p style={{ display: "none" }}>No userId found — Messenger hidden</p>
      )}
    </>
  );
}

export default Home;