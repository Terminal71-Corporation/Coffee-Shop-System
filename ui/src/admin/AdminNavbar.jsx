function AdminNavbar({ activeView, setActiveView }) {
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("user");
      localStorage.removeItem("user_id");
      window.location.href = "/login";
    }
  };

  return (
    <div className="admin-navbar">

      {/* LOGO */}
      <div className="admin-logo">
        <h2>Coffee Admin</h2>
        <p>System Panel</p>
      </div>

      {/* MENU */}
      <div className="admin-menu">

        <div className="menu-section-title">MAIN</div>

        <div
          className={`menu-item ${activeView === "products" ? "active" : ""}`}
          onClick={() => setActiveView("products")}
        >
          📦 Products
        </div>

        <div
          className={`menu-item ${activeView === "users" ? "active" : ""}`}
          onClick={() => setActiveView("users")}
        >
          👥 Users
        </div>

        <div
          className={`menu-item ${activeView === "orders" ? "active" : ""}`}
          onClick={() => setActiveView("orders")}
        >
          🧾 Orders
        </div>

        <div
          className={`menu-item ${activeView === "messages" ? "active" : ""}`}
          onClick={() => setActiveView("messages")}
        >
          💬 Messages
        </div>

      </div>

      {/* LOGOUT AT BOTTOM */}
      <div className="admin-logout">
        <div className="menu-divider"></div>
        <div className="menu-item logout" onClick={handleLogout}>
          🚪 Logout
        </div>
      </div>

    </div>
  );
}

export default AdminNavbar;