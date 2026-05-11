import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";

const CATEGORIES = [
  "All",
  "Espresso",
  "Latte",
  "Tea",
  "Pastries",
  "Beans",
  "Equipment",
];

function Navbar({
  setUser,
  activeCategory,
  setActiveCategory,
}) {

  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [search, setSearch] = useState("");

  const [suggestions, setSuggestions] = useState([]);

  const handleLogout = () => {

    localStorage.removeItem("user");

    setUser(null);

    navigate("/login");
  };

  const handleSearch = (e) => {

    e.preventDefault();

    navigate(`/products?search=${search}`);

    setSuggestions([]);
  };

  const handleCategoryClick = (cat) => {

    if (setActiveCategory)
      setActiveCategory(cat);

    if (cat === "All") {
      navigate("/products");
    } else {
      navigate(
        `/products?cat=${cat.toLowerCase()}`
      );
    }
  };

  useEffect(() => {

    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => {

        if (search.length > 0) {

          const filtered = data.filter((p) =>
            p.name
              .toLowerCase()
              .includes(search.toLowerCase())
          );

          setSuggestions(filtered);

        } else {
          setSuggestions([]);
        }

      });

  }, [search]);

  return (
    <header className="site-header">

      <div className="topbar">

        <span className="topbar-tagline">
          Premium Coffee Experience ☕
        </span>

        <div className="topbar-right">

          {user && (
            <span>
              Hi, <strong>{user.username}</strong>
            </span>
          )}

          <Link to="/profile">
            My Account
          </Link>

          <button
            className="topbar-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </div>

      <nav className="navbar-main">

        <Link
          to="/home"
          className="navbar-logo"
        >
          ☕ Coffee<span>Shop</span>
        </Link>

        <div className="search-wrapper">

          <form
            className="search-bar"
            onSubmit={handleSearch}
          >

            <input
              type="text"
              placeholder="Search coffee..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="search-input"
            />

            <button
              type="submit"
              className="search-btn"
            >
              🔍
            </button>

          </form>

          {suggestions.length > 0 && (

            <div className="search-suggestions">

              {suggestions
                .slice(0,5)
                .map((item) => (

                  <div
                    key={item.product_id}
                    className="suggestion-item"
                    onClick={() => {

                      navigate(
                        `/products?search=${item.name}`
                      );

                      setSearch(item.name);

                      setSuggestions([]);
                    }}
                  >
                    {item.name}
                  </div>

              ))}

            </div>

          )}

        </div>

        <div className="navbar-actions">

          <Link to="/home" className="action-btn">
            🏠
          </Link>

          <Link
            to="/products"
            className="action-btn"
          >
            ☕
          </Link>

          <Link
            to="/cart"
            className="action-btn"
          >
            🛒
          </Link>

          <Link
            to="/orders"
            className="action-btn"
          >
            📦
          </Link>

        </div>

      </nav>

      <nav className="navbar-categories">

        {CATEGORIES.map((cat) => (

          <button
            key={cat}
            className={`cat-link ${
              activeCategory === cat
                ? "cat-active"
                : ""
            }`}
            onClick={() =>
              handleCategoryClick(cat)
            }
          >
            {cat}
          </button>

        ))}

      </nav>

    </header>
  );
}

export default Navbar;