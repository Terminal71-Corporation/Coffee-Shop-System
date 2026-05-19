import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";
import NotificationBell from "./NotificationBell";

const CATEGORIES = ["All", "Espresso", "Latte", "Tea"];

function Navbar({ setUser, activeCategory, setActiveCategory }) {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";
  const userId = user?.user_id || null;

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [profileImage, setProfileImage] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [activeOrderCount, setActiveOrderCount] = useState(0);

  const refreshBadges = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.reduce((sum, item) => sum + (item.quantity || 1), 0));
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    setActiveOrderCount(
      orders.filter((o) => o.status !== "completed" && o.status !== "voided" && o.status !== "shipped").length
    );
  };

  const refreshProfileImage = async () => {
    const id = localStorage.getItem("user_id");
    if (!id) return;
    try {
      const res = await fetch(`http://localhost:5000/users/${id}`);
      const data = await res.json();
      setProfileImage(data.profile_picture || "");
    } catch {
      setProfileImage("");
    }
  };

  useEffect(() => {
    refreshBadges();
    refreshProfileImage();
    const onStorage = () => { refreshBadges(); refreshProfileImage(); };
    window.addEventListener("storage", onStorage);
    const interval = setInterval(refreshBadges, 800);
    return () => { window.removeEventListener("storage", onStorage); clearInterval(interval); };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    localStorage.removeItem("notifications");
    setUser(null);
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products?search=${search}`);
    setSuggestions([]);
  };

  const handleCategoryClick = (cat) => {
    if (setActiveCategory) setActiveCategory(cat);
    cat === "All" ? navigate("/products") : navigate(`/products?cat=${cat.toLowerCase()}`);
  };

  const handleMessengerToggle = () => {
    window.dispatchEvent(new CustomEvent("toggle-messenger"));
  };

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => {
        setSuggestions(
          search.length > 0
            ? data.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
            : []
        );
      });
  }, [search]);

  const initials = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.username ? user.username.charAt(0).toUpperCase() : "?";

  return (
    <header className="site-header">
      <div className="topbar">
        <span className="topbar-tagline">Premium Coffee Experience ☕</span>
        <div className="topbar-right">
          <button className="topbar-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <nav className="navbar-main">
        <Link to="/home" className="navbar-logo">☕ Coffee<span>Shop</span></Link>

        <div className="search-wrapper">
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search coffee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">🔍</button>
          </form>
          {suggestions.length > 0 && (
            <div className="search-suggestions">
              {suggestions.slice(0, 5).map((item) => (
                <div
                  key={item.product_id}
                  className="suggestion-item"
                  onClick={() => { navigate(`/products?search=${item.name}`); setSearch(item.name); setSuggestions([]); }}
                >
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="navbar-actions">
          <Link to="/home" className="action-btn">🏠</Link>
          <Link to="/products" className="action-btn">☕</Link>

          {/* Cart */}
          <Link to="/cart" className="action-btn action-btn--icon">
            🛒
            {cartCount > 0 && <span className="nav-badge nav-badge--cart">{cartCount > 99 ? "99+" : cartCount}</span>}
          </Link>

          {/* Orders */}
          <Link to="/orders" className="action-btn action-btn--icon">
            📦
            {activeOrderCount > 0 && <span className="nav-badge nav-badge--orders">{activeOrderCount > 99 ? "99+" : activeOrderCount}</span>}
          </Link>

          {/* 🔔 Notifications — all users */}
          <NotificationBell userId={userId} />

          {/* 💬 Messages — regular users only */}
          {!isAdmin && (
            <button
              className="action-btn action-btn--icon"
              onClick={handleMessengerToggle}
              title="Messages"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >💬</button>
          )}

          {/* 🛡️ Admin panel — admin only */}
          {isAdmin && (
            <Link to="/admin" className="action-btn action-btn--icon" title="Admin Panel" style={{ fontSize: "18px" }}>
              🛡️
            </Link>
          )}
        </div>

        {/* Profile avatar */}
        <Link to="/profile" className="action-btn action-btn--icon nav-avatar-link" title="My Account">
          {profileImage ? (
            <img src={profileImage} alt="profile" className="nav-avatar-img" onError={(e) => { e.target.style.display = "none"; }} />
          ) : (
            <span className="nav-avatar-initials">{initials}</span>
          )}
        </Link>
      </nav>

      <nav className="navbar-categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`cat-link ${activeCategory === cat ? "cat-active" : ""}`}
            onClick={() => handleCategoryClick(cat)}
          >{cat}</button>
        ))}
      </nav>
    </header>
  );
}

export default Navbar;