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

      <div className="featured-section">

        <h2>🔥 Best Sellers</h2>

        <div className="products-grid">

          <div className="product-card">
            <img
              src="https://images.unsplash.com/photo-1509042239860-f550ce710b93"
              alt=""
            />

            <h3>Caramel Latte</h3>

            <p>₱180</p>

            <button>Add to Cart</button>
          </div>

          <div className="product-card">
            <img
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085"
              alt=""
            />

            <h3>Mocha Espresso</h3>

            <p>₱220</p>

            <button>Add to Cart</button>
          </div>

          <div className="product-card">
            <img
              src="https://images.unsplash.com/photo-1511920170033-f8396924c348"
              alt=""
            />

            <h3>Cold Brew</h3>

            <p>₱160</p>

            <button>Add to Cart</button>
          </div>

        </div>

      </div>

      {/* 💬 REAL CHAT */}
      <Messenger userId={user?.user_id} />
    </>
  );
}

export default Home;