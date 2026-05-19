import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Orders.css";

const STATUS_LABELS = {
  pending_payment: { label: "Pending Payment",      color: "#e67e22", bg: "rgba(230,126,34,0.15)" },
  preparing:       { label: "Preparing",             color: "#d4a055", bg: "rgba(212,160,85,0.15)" },
  // legacy alias
  ordered:         { label: "Preparing",             color: "#d4a055", bg: "rgba(212,160,85,0.15)" },
  ready:           { label: "Ready for Pick-up",     color: "#27ae60", bg: "rgba(39,174,96,0.15)" },
  delivering:      { label: "Delivering",             color: "#3498db", bg: "rgba(52,152,219,0.15)" },
  shipped:         { label: "Shipped / Received",    color: "#9b59b6", bg: "rgba(155,89,182,0.15)" },
  completed:       { label: "Completed",              color: "#1abc9c", bg: "rgba(26,188,156,0.15)" },
  voided:          { label: "Voided",                 color: "#e74c3c", bg: "rgba(231,76,60,0.15)" },
  cancelled:       { label: "Cancelled",              color: "#e74c3c", bg: "rgba(231,76,60,0.15)" },
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

// Tabs per channel
const STORE_TABS = [
  { key: "all",             label: "All" },
  { key: "pending_payment", label: "Pending Payment" },
  { key: "preparing",       label: "Preparing" },
  { key: "ready",           label: "Ready for Pick-up" },
  { key: "completed",       label: "Completed" },
  { key: "voided",          label: "Voided" },
];

const ONLINE_TABS = [
  { key: "all",             label: "All" },
  { key: "pending_payment", label: "Pending Payment" },
  { key: "preparing",       label: "Preparing" },
  { key: "delivering",      label: "Delivering" },
  { key: "shipped",         label: "Shipped / Received" },
  { key: "cancelled",       label: "Cancelled" },
  { key: "voided",          label: "Voided" },
];

// Which statuses are cancellable (online only)
const CANCELLABLE_STATUSES = ["pending_payment", "preparing"];

function Orders({ setUser }) {
  const [orders, setOrders]       = useState([]);
  const [channel, setChannel]     = useState("store");   // "store" | "online"
  const [storeFilter, setStoreFilter]   = useState("all");
  const [onlineFilter, setOnlineFilter] = useState("all");
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

  const handleCancelOrder = (orderId) => {
    const stored = JSON.parse(localStorage.getItem("orders")) || [];
    const updated = stored.map((o) =>
      o.orderId === orderId ? { ...o, status: "cancelled" } : o
    );
    localStorage.setItem("orders", JSON.stringify(updated));
    loadOrders();
  };

  // Normalise legacy "ordered" → "preparing" for display
  const normalise = (o) =>
    o.status === "ordered" ? { ...o, status: "preparing" } : o;

  const storeOrders  = orders.map(normalise).filter((o) => o.fulfillment === "counter" || !o.fulfillment);
  const onlineOrders = orders.map(normalise).filter((o) => o.fulfillment === "delivery");

  const activeFilter = channel === "store" ? storeFilter : onlineFilter;
  const setActiveFilter = channel === "store" ? setStoreFilter : setOnlineFilter;
  const activeTabs   = channel === "store" ? STORE_TABS : ONLINE_TABS;
  const activeOrders = channel === "store" ? storeOrders : onlineOrders;

  const filtered =
    activeFilter === "all"
      ? activeOrders
      : activeOrders.filter((o) => o.status === activeFilter);

  return (
    <>
      <Navbar setUser={setUser} />
      <div className="orders-page">
        <div className="orders-header">
          <h1>📦 My Orders</h1>
        </div>

        {/* ── Channel switcher (like Orders Board) ── */}
        <div className="orders-channel-switcher">
          <button
            className={`orders-channel-btn ${channel === "store" ? "active" : ""}`}
            onClick={() => setChannel("store")}
          >
            🏪 Store / Counter
          </button>
          <button
            className={`orders-channel-btn ${channel === "online" ? "active" : ""}`}
            onClick={() => setChannel("online")}
          >
            🚚 Online / Delivery
          </button>
        </div>

        {/* ── Status tabs ── */}
        <div className="orders-tabs">
          {activeTabs.map((tab) => (
            <button
              key={tab.key}
              className={`orders-tab ${activeFilter === tab.key ? "active" : ""}`}
              onClick={() => setActiveFilter(tab.key)}
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
              <OrderCard
                key={order.orderId || i}
                order={order}
                isOnline={channel === "online"}
                onCancel={handleCancelOrder}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function OrderCard({ order, isOnline, onCancel }) {
  const [expanded, setExpanded]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const items = order.items || [{
    cartId:    order.cartId,
    name:      order.name,
    price:     order.price,
    quantity:  order.quantity,
    image_url: order.image_url,
    addons:    order.addons,
  }];

  const status      = STATUS_LABELS[order.status]         || STATUS_LABELS.preparing;
  const payment     = PAYMENT_LABELS[order.paymentMethod]  || null;
  const fulfillment = FULFILLMENT_LABELS[order.fulfillment] || null;
  const hasDelivery = order.fulfillment === "delivery" && order.deliveryInfo;
  const showPickupNote    = order.status === "ready" && order.fulfillment === "counter";
  const showPreparingNote = order.status === "preparing";
  const showPendingNote   = order.status === "pending_payment";
  const isVoided    = order.status === "voided";
  const isCancelled = order.status === "cancelled";
  const canCancel   = isOnline && CANCELLABLE_STATUSES.includes(order.status);

  const grandTotal = order.total
    ? parseFloat(order.total).toFixed(2)
    : items.reduce((sum, item) => sum + parseFloat(item.price) * (item.quantity || 1), 0).toFixed(2);

  return (
    <div className={`order-card ${isVoided || isCancelled ? "order-card--voided" : ""}`}>
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

      {/* ── Pending Payment note ── */}
      {showPendingNote && (
        <div className="order-pending-note">
          ⏳ Waiting for payment confirmation from our admin. Please make sure you've sent your GCash reference number.
        </div>
      )}

      {/* ── Preparing note ── */}
      {showPreparingNote && (
        <div className="order-preparing-note">
          ☕ Your order is being prepared! We'll update you once it's ready.
        </div>
      )}

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

      {/* ── Cancel order (online / delivery only, while still "ordered") ── */}
      {canCancel && (
        <div className="order-cancel-section">
          {!showConfirm ? (
            <button
              className="order-cancel-btn"
              onClick={() => setShowConfirm(true)}
            >
              Cancel Order
            </button>
          ) : (
            <div className="order-cancel-confirm">
              <span>
                {order.status === "pending_payment"
                  ? "Cancel this order? Since payment hasn't been confirmed yet, no refund is needed."
                  : "Are you sure you want to cancel this order? If you already paid via GCash, please contact us for a refund."}
              </span>
              <div className="order-cancel-confirm-btns">
                <button
                  className="order-cancel-confirm-yes"
                  onClick={() => {
                    onCancel(order.orderId);
                    setShowConfirm(false);
                  }}
                >
                  Yes, Cancel
                </button>
                <button
                  className="order-cancel-confirm-no"
                  onClick={() => setShowConfirm(false)}
                >
                  Keep Order
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Orders;