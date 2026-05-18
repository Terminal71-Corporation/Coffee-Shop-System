import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Orders.css";

const STATUS_LABELS = {
  ordered:    { label: "Order Placed",        color: "#d4a055", bg: "rgba(212,160,85,0.15)" },
  ready:      { label: "Ready for Pick-up",   color: "#27ae60", bg: "rgba(39,174,96,0.15)" },
  delivering: { label: "Delivering",           color: "#3498db", bg: "rgba(52,152,219,0.15)" },
  shipped:    { label: "Shipped / Received",   color: "#3cb371", bg: "rgba(46,139,87,0.15)" },
};

const PAYMENT_LABELS = {
  gcash: { label: "GCash",             icon: "📱", color: "#00b4ff", bg: "rgba(0,180,255,0.12)" },
  cash:  { label: "Cash to Counter",   icon: "💵", color: "#27ae60", bg: "rgba(39,174,96,0.12)" },
  cod:   { label: "Cash on Delivery",  icon: "🚚", color: "#d4a055", bg: "rgba(212,160,85,0.12)" },
};

const FULFILLMENT_LABELS = {
  counter:  { label: "Counter Pick-up", icon: "🏪" },
  delivery: { label: "Delivery",        icon: "🚚" },
};

// Tabs: counter orders show "ready" instead of "delivering"
const TABS = [
  { key: "all",        label: "All Orders" },
  { key: "ordered",    label: "Order Placed" },
  { key: "ready",      label: "Ready for Pick-up" },
  { key: "delivering", label: "Delivering" },
  { key: "shipped",    label: "Shipped / Received" },
];

function Orders({ setUser }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
    const onStorage = () => loadOrders();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const loadOrders = () => {
    const stored = JSON.parse(localStorage.getItem("orders")) || [];
    setOrders([...stored].reverse());
  };

  const clearOrders = () => {
    if (window.confirm("Clear all order history?")) {
      localStorage.setItem("orders", JSON.stringify([]));
      setOrders([]);
    }
  };

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);



  return (
    <>
      <Navbar setUser={setUser} />
      <div className="orders-page">
        <div className="orders-header">
          <h1>📦 My Orders</h1>
          {orders.length > 0 && (
            <button className="orders-clear-btn" onClick={clearOrders}>Clear History</button>
          )}
        </div>

        <div className="orders-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`orders-tab ${filter === tab.key ? "active" : ""}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
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
  const [expanded, setExpanded] = useState(false);

  const imageUrl =
    order.image_url && order.image_url.trim() !== ""
      ? order.image_url
      : "https://via.placeholder.com/90x90?text=No+Image";

  const status      = STATUS_LABELS[order.status]         || STATUS_LABELS.ordered;
  const payment     = PAYMENT_LABELS[order.paymentMethod]  || null;
  const fulfillment = FULFILLMENT_LABELS[order.fulfillment] || null;
  const subtotal    = (parseFloat(order.price) * (order.quantity || 1)).toFixed(2);
  const hasDelivery = order.fulfillment === "delivery" && order.deliveryInfo;

  // Show a pick-up reminder when status is "ready" and fulfillment is counter
  const showPickupNote = order.status === "ready" && order.fulfillment === "counter";

  return (
    <div className="order-card">
      <div className="order-card-main">
        <img
          src={imageUrl}
          alt={order.name}
          onError={(e) => { e.target.src = "https://via.placeholder.com/90x90?text=Err"; }}
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

          {order.addons && <p className="order-addons">Add-ons: {order.addons}</p>}

          <div className="order-badges">
            {fulfillment && (
              <span className="order-fulfillment-badge">
                {fulfillment.icon} {fulfillment.label}
              </span>
            )}
            {payment && (
              <span
                className="order-payment-badge"
                style={{ color: payment.color, background: payment.bg }}
              >
                {payment.icon} {payment.label}
              </span>
            )}
          </div>

          {/* Pick-up reminder pill */}
          {showPickupNote && (
            <div className="order-pickup-note">
              🏪 Your order is ready! Please proceed to the counter to pick up and pay.
            </div>
          )}

          <p className="order-date">{order.date}</p>

          {hasDelivery && (
            <button
              className="order-expand-btn"
              onClick={() => setExpanded((p) => !p)}
            >
              {expanded ? "▲ Hide details" : "▼ Delivery details"}
            </button>
          )}
        </div>

        <div className="order-right">
          <p className="order-qty">×{order.quantity || 1}</p>
          <p className="order-subtotal">₱{subtotal}</p>
        </div>
      </div>

      {/* Expandable delivery info */}
      {expanded && hasDelivery && (
        <div className="order-delivery-info">
          <div className="order-delivery-row">
            <span className="order-delivery-key">Name</span>
            <span className="order-delivery-val">{order.deliveryInfo.name}</span>
          </div>
          <div className="order-delivery-row">
            <span className="order-delivery-key">Phone</span>
            <span className="order-delivery-val">{order.deliveryInfo.phone}</span>
          </div>
          <div className="order-delivery-row">
            <span className="order-delivery-key">Address</span>
            <span className="order-delivery-val">{order.deliveryInfo.address}</span>
          </div>
          {order.deliveryInfo.note && (
            <div className="order-delivery-row">
              <span className="order-delivery-key">Note</span>
              <span className="order-delivery-val">{order.deliveryInfo.note}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Orders;
