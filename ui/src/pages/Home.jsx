import Navbar from "../components/Navbar";
import "./Home.css";
import Messenger from "../components/Messenger";
import { useNavigate } from "react-router-dom"; // 👈 add this

function Home({ setUser }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate(); // 👈 add this

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

          <button onClick={() => navigate("/products")}> {/* 👈 add onClick */}
            Shop Now
          </button>
        </div>
      </div>

      {/* 💬 REAL CHAT */}
      <Messenger userId={user?.user_id} />
    </>
  );
}

export default Home;