function AdminNavbar({ activeView, setActiveView }) {
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      // clear auth if you have token later
      localStorage.removeItem("token");
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

        {/* MAIN */}
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

        {/* SYSTEM */}
        <div className="menu-divider"></div>
        <div className="menu-section-title">SYSTEM</div>

        <div
          className={`menu-item ${activeView === "analysis" ? "active" : ""}`}
          onClick={() => setActiveView("analysis")}
        >
          📊 Analysis
        </div>

        <div
          className={`menu-item ${activeView === "settings" ? "active" : ""}`}
          onClick={() => setActiveView("settings")}
        >
          ⚙️ Settings
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