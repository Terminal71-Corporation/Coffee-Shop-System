import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Orders.css";

const STATUS_LABELS = {
  ordered: { label: "Order Placed", color: "#d4a055", bg: "rgba(212,160,85,0.15)" },
  delivering: { label: "Delivering", color: "#3498db", bg: "rgba(52,152,219,0.15)" },
  shipped: { label: "Shipped / Received", color: "#3cb371", bg: "rgba(46,139,87,0.15)" },
};

function Orders({ setUser }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();

    // Re-sync when localStorage changes (e.g. admin updates status)
    const onStorage = () => loadOrders();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const loadOrders = () => {
    const stored = JSON.parse(localStorage.getItem("orders")) || [];
    // newest first
    setOrders([...stored].reverse());
  };

  const clearOrders = () => {
    if (window.confirm("Clear all order history?")) {
      localStorage.setItem("orders", JSON.stringify([]));
      setOrders([]);
    }
  };

  const filtered =
    filter === "all"
      ? orders
      : orders.filter((o) => o.status === filter);

  return (
    <>
      <Navbar setUser={setUser} />

      <div className="orders-page">
        <div className="orders-header">
          <h1>📦 My Orders</h1>
          {orders.length > 0 && (
            <button className="orders-clear-btn" onClick={clearOrders}>
              Clear History
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="orders-tabs">
          {["all", "ordered", "delivering", "shipped"].map((tab) => (
            <button
              key={tab}
              className={`orders-tab ${filter === tab ? "active" : ""}`}
              onClick={() => setFilter(tab)}
            >
              {tab === "all"
                ? "All Orders"
                : tab === "ordered"
                ? "Order Placed"
                : tab === "delivering"
                ? "Delivering"
                : "Shipped"}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">📦</div>
            <h2>No orders here yet</h2>
            <p>Your purchases will appear here once you buy something.</p>
            <button onClick={() => navigate("/products")}>Browse Products</button>
          </div>
        ) : (
          <div className="orders-list">
            {filtered.map((order, i) => (
              <OrderCard key={order.orderId || i} order={order} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function OrderCard({ order }) {
  const imageUrl =
    order.image_url && order.image_url.trim() !== ""
      ? order.image_url
      : "https://via.placeholder.com/90x90?text=No+Image";

  const status = STATUS_LABELS[order.status] || STATUS_LABELS.ordered;
  const subtotal = (parseFloat(order.price) * (order.quantity || 1)).toFixed(2);

  return (
    <div className="order-card">
      <img
        src={imageUrl}
        alt={order.name}
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/90x90?text=Err";
        }}
      />
      <div className="order-info">
        <div className="order-info-top">
          <h3>{order.name}</h3>
          <span
            className="order-status-badge"
            style={{ color: status.color, background: status.bg }}
          >
            {status.label}
          </span>
        </div>
        {order.addons && (
          <p className="order-addons">Add-ons: {order.addons}</p>
        )}
        <p className="order-date">{order.date}</p>
      </div>
      <div className="order-right">
        <p className="order-qty">×{order.quantity || 1}</p>
        <p className="order-subtotal">₱{subtotal}</p>
      </div>
    </div>
  );
}

export default Orders;