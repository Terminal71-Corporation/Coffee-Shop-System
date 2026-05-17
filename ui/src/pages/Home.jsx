import Navbar from "../components/Navbar";
import "./Home.css";
import Messenger from "../components/Messenger";

function Home({ setUser }) {

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <>
      <Navbar setUser={setUser} />

      <div className="hero">

        <div className="hero-overlay"></div>

        <div className="hero-content">

          <h1>
            Brewed For <span>You</span>
          </h1>

          <p>
            Experience handcrafted coffee made with passion.
          </p>

          <button>
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