import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Orders.css";

const STATUS_LABELS = {
  ordered:    { label: "Order Placed",        color: "#d4a055", bg: "rgba(212,160,85,0.15)" },
  ready:      { label: "Ready for Pick-up",   color: "#27ae60", bg: "rgba(39,174,96,0.15)" },
  delivering: { label: "Delivering",           color: "#3498db", bg: "rgba(52,152,219,0.15)" },
  shipped:    { label: "Shipped / Received",   color: "#9b59b6", bg: "rgba(155,89,182,0.15)" },
  completed:  { label: "Completed",            color: "#1abc9c", bg: "rgba(26,188,156,0.15)" },
  voided:     { label: "Voided",               color: "#e74c3c", bg: "rgba(231,76,60,0.15)" },
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

const TABS = [
  { key: "all",        label: "All Orders" },
  { key: "ordered",    label: "Order Placed" },
  { key: "ready",      label: "Ready for Pick-up" },
  { key: "delivering", label: "Delivering" },
  { key: "shipped",    label: "Shipped / Received" },
  { key: "completed",  label: "Completed" },
  { key: "voided",     label: "Voided" },
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

  // Support both old (single-item) and new (grouped items[]) format
  const items = order.items || [{
    cartId: order.cartId,
    name: order.name,
    price: order.price,
    quantity: order.quantity,
    image_url: order.image_url,
    addons: order.addons,
  }];

  const status      = STATUS_LABELS[order.status]          || STATUS_LABELS.ordered;
  const payment     = PAYMENT_LABELS[order.paymentMethod]   || null;
  const fulfillment = FULFILLMENT_LABELS[order.fulfillment]  || null;
  const hasDelivery = order.fulfillment === "delivery" && order.deliveryInfo;
  const showPickupNote = order.status === "ready" && order.fulfillment === "counter";
  const isVoided    = order.status === "voided";

  const grandTotal = order.total
    ? parseFloat(order.total).toFixed(2)
    : items.reduce((sum, item) => sum + parseFloat(item.price) * (item.quantity || 1), 0).toFixed(2);

  return (
    <div className={`order-card ${isVoided ? "order-card--voided" : ""}`}>
      {/* ── Transaction Header ── */}
      <div className="order-txn-header">
        <div className="order-txn-left">
          <span className="order-number">{order.orderNumber || "—"}</span>
          <span className="order-txn-date">{order.date}</span>
        </div>
        <div className="order-txn-right">
          <span
            className="order-status-badge"
            style={{ color: status.color, background: status.bg }}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* ── Badges row ── */}
      <div className="order-badges" style={{ padding: "0 0 10px" }}>
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

      {/* ── Pick-up note ── */}
      {showPickupNote && (
        <div className="order-pickup-note">
          🏪 Your order is ready! Please proceed to the counter to pick up and pay.
        </div>
      )}

      {/* ── Items list ── */}
      <div className="order-items-list">
        {items.map((item, idx) => {
          const imageUrl =
            item.image_url && item.image_url.trim() !== ""
              ? item.image_url
              : "https://via.placeholder.com/70x70?text=?";
          const subtotal = (parseFloat(item.price) * (item.quantity || 1)).toFixed(2);

          return (
            <div key={item.cartId || idx} className="order-item-row">
              <img
                src={imageUrl}
                alt={item.name}
                onError={(e) => { e.target.src = "https://via.placeholder.com/70x70?text=Err"; }}
              />
              <div className="order-item-info">
                <span className="order-item-name">{item.name}</span>
                {item.addons && <span className="order-addons">Add-ons: {item.addons}</span>}
                <span className="order-item-price">₱{item.price} × {item.quantity || 1}</span>
              </div>
              <span className="order-item-subtotal">₱{subtotal}</span>
            </div>
          );
        })}
      </div>

      {/* ── Grand Total ── */}
      <div className="order-grand-total">
        <span>Total</span>
        <span>₱{grandTotal}</span>
      </div>

      {/* ── Delivery expand ── */}
      {hasDelivery && (
        <button
          className="order-expand-btn"
          onClick={() => setExpanded((p) => !p)}
        >
          {expanded ? "▲ Hide delivery details" : "▼ Delivery details"}
        </button>
      )}

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