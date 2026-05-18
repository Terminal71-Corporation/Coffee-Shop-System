import { useEffect, useState, useRef } from "react";

// ── Status config ─────────────────────────────────────────────────
const COUNTER_FLOW = ["ordered", "ready", "completed"];
const DELIVERY_FLOW = ["ordered", "delivering", "shipped"];

const COLUMNS = [
  {
    key: "ordered",
    label: "Order Placed",
    icon: "🧾",
    color: "#d4a055",
    colorBg: "rgba(212,160,85,0.10)",
    colorBorder: "rgba(212,160,85,0.25)",
    colorGlow: "rgba(212,160,85,0.18)",
  },
  {
    key: "ready",
    label: "Ready for Pick-up",
    icon: "🏪",
    color: "#27ae60",
    colorBg: "rgba(39,174,96,0.10)",
    colorBorder: "rgba(39,174,96,0.25)",
    colorGlow: "rgba(39,174,96,0.18)",
    onlyFor: "counter",
  },
  {
    key: "delivering",
    label: "Delivering",
    icon: "🚗",
    color: "#3498db",
    colorBg: "rgba(52,152,219,0.10)",
    colorBorder: "rgba(52,152,219,0.25)",
    colorGlow: "rgba(52,152,219,0.18)",
    onlyFor: "delivery",
  },
  {
    key: "shipped",
    label: "Shipped / Received",
    icon: "📦",
    color: "#9b59b6",
    colorBg: "rgba(155,89,182,0.10)",
    colorBorder: "rgba(155,89,182,0.25)",
    colorGlow: "rgba(155,89,182,0.18)",
    onlyFor: "delivery",
  },
  {
    key: "completed",
    label: "Completed",
    icon: "✅",
    color: "#1abc9c",
    colorBg: "rgba(26,188,156,0.10)",
    colorBorder: "rgba(26,188,156,0.25)",
    colorGlow: "rgba(26,188,156,0.18)",
    onlyFor: "counter",
  },
];

const PAYMENT_META = {
  gcash: { label: "GCash",            icon: "📱", color: "#00b4ff" },
  cash:  { label: "Cash to Counter",  icon: "💵", color: "#27ae60" },
  cod:   { label: "COD",              icon: "🚗", color: "#d4a055" },
};

// ── Helpers ───────────────────────────────────────────────────────
function getNextStatus(order) {
  const flow = order.fulfillment === "delivery" ? DELIVERY_FLOW : COUNTER_FLOW;
  const idx = flow.indexOf(order.status);
  return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
}

function getNextLabel(nextStatus) {
  const col = COLUMNS.find((c) => c.key === nextStatus);
  return col ? `${col.icon} Mark as ${col.label}` : null;
}

function loadOrders() {
  return JSON.parse(localStorage.getItem("orders") || "[]");
}

function saveOrders(orders) {
  localStorage.setItem("orders", JSON.stringify(orders));
}

// ── Main Component ────────────────────────────────────────────────
export default function AdminOrdersBoard() {
  const [orders, setOrders] = useState([]);
  const [dragId, setDragId] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all"); // all | counter | delivery
  const dragItem = useRef(null);

  useEffect(() => {
    setOrders(loadOrders());
    const onStorage = () => setOrders(loadOrders());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ── Update status ──
  const updateStatus = (orderId, newStatus) => {
    const updated = orders.map((o) =>
      String(o.orderId) === String(orderId) ? { ...o, status: newStatus } : o
    );
    setOrders(updated);
    saveOrders(updated);
  };

  // ── Toggle GCash payment confirmed ──
  const toggleGcashPaid = (orderId) => {
    const updated = orders.map((o) =>
      String(o.orderId) === String(orderId) ? { ...o, gcashPaid: !o.gcashPaid } : o
    );
    setOrders(updated);
    saveOrders(updated);
  };

  // ── Drag handlers ──
  const onDragStart = (e, order) => {
    dragItem.current = order;
    setDragId(order.orderId);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e, colKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(colKey);
  };

  const onDrop = (e, colKey) => {
    e.preventDefault();
    setDragOver(null);
    setDragId(null);
    if (!dragItem.current) return;
    const order = dragItem.current;
    // Only allow valid moves in the order's flow
    const flow = order.fulfillment === "delivery" ? DELIVERY_FLOW : COUNTER_FLOW;
    if (!flow.includes(colKey)) return;
    if (order.status === colKey) return;
    updateStatus(order.orderId, colKey);
    dragItem.current = null;
  };

  const onDragEnd = () => {
    setDragId(null);
    setDragOver(null);
    dragItem.current = null;
  };

  // ── Filter orders per column ──
  const filteredOrders = orders.filter((o) => {
    if (filter === "counter") return o.fulfillment === "counter";
    if (filter === "delivery") return o.fulfillment === "delivery";
    return true;
  });

  const ordersForCol = (colKey) =>
    filteredOrders.filter((o) => o.status === colKey);

  // ── Visible columns ──
  const visibleCols = COLUMNS.filter((col) => {
    if (filter === "counter") return !col.onlyFor || col.onlyFor === "counter";
    if (filter === "delivery") return !col.onlyFor || col.onlyFor === "delivery";
    return true;
  });

  return (
    <div className="aob-root">

      {/* ── Toolbar ── */}
      <div className="aob-toolbar">
        <div className="aob-filter-group">
          {["all", "counter", "delivery"].map((f) => (
            <button
              key={f}
              className={`aob-filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All Orders" : f === "counter" ? "🏪 Counter" : "🚗 Delivery"}
            </button>
          ))}
        </div>
        <div className="aob-total-pill">
          {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── Board ── */}
      <div className="aob-board">
        {visibleCols.map((col) => {
          const colOrders = ordersForCol(col.key);
          const isOver = dragOver === col.key;

          return (
            <div
              key={col.key}
              className={`aob-column ${isOver ? "aob-column--over" : ""}`}
              style={{
                "--col-color": col.color,
                "--col-bg": col.colorBg,
                "--col-border": col.colorBorder,
                "--col-glow": col.colorGlow,
              }}
              onDragOver={(e) => onDragOver(e, col.key)}
              onDrop={(e) => onDrop(e, col.key)}
              onDragLeave={() => setDragOver(null)}
            >
              {/* Column header */}
              <div className="aob-col-header">
                <span className="aob-col-icon">{col.icon}</span>
                <span className="aob-col-label">{col.label}</span>
                <span className="aob-col-count">{colOrders.length}</span>
              </div>

              {/* Drop zone hint */}
              {isOver && (
                <div className="aob-drop-hint">Drop here</div>
              )}

              {/* Cards */}
              <div className="aob-cards">
                {colOrders.length === 0 && !isOver && (
                  <div className="aob-empty-col">No orders</div>
                )}
                {colOrders.map((order) => (
                  <OrderCard
                    key={order.orderId}
                    order={order}
                    col={col}
                    isDragging={dragId === order.orderId}
                    expanded={expandedId === order.orderId}
                    onToggle={() =>
                      setExpandedId((p) => (p === order.orderId ? null : order.orderId))
                    }
                    onAdvance={() => {
                      const next = getNextStatus(order);
                      if (next) updateStatus(order.orderId, next);
                    }}
                    onToggleGcash={() => toggleGcashPaid(order.orderId)}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Order Card ────────────────────────────────────────────────────
function OrderCard({ order, col, isDragging, expanded, onToggle, onAdvance, onToggleGcash, onDragStart, onDragEnd }) {
  const next = getNextStatus(order);
  const nextLabel = next ? getNextLabel(next) : null;
  const payment = PAYMENT_META[order.paymentMethod] || null;
  const subtotal = (parseFloat(order.price || 0) * (order.quantity || 1)).toFixed(2);
  const isGcash = order.paymentMethod === "gcash";
  const gcashPaid = order.gcashPaid === true;

  const imgSrc =
    order.image_url && order.image_url.trim()
      ? order.image_url
      : "https://via.placeholder.com/48x48?text=?";

  return (
    <div
      className={`aob-card ${isDragging ? "aob-card--dragging" : ""}`}
      draggable
      onDragStart={(e) => onDragStart(e, order)}
      onDragEnd={onDragEnd}
      style={{ "--col-color": col.color, "--col-border": col.colorBorder, "--col-bg": col.colorBg }}
    >
      {/* Drag handle */}
      <div className="aob-drag-handle" title="Drag to move">⠿</div>

      {/* Customer name */}
      {order.customerName && (
        <div className="aob-customer-name">
          <span className="aob-customer-icon">👤</span>
          {order.customerName}
        </div>
      )}

      {/* Card top */}
      <div className="aob-card-top">
        <img
          src={imgSrc}
          className="aob-card-img"
          alt={order.name}
          onError={(e) => { e.target.src = "https://via.placeholder.com/48x48?text=?"; }}
        />
        <div className="aob-card-info">
          <p className="aob-card-name">{order.name}</p>
          {order.addons && (
            <p className="aob-card-addons">+{order.addons}</p>
          )}
          <p className="aob-card-subtotal">₱{subtotal} <span className="aob-card-qty">×{order.quantity || 1}</span></p>
        </div>
      </div>

      {/* Badges */}
      <div className="aob-card-badges">
        <span className={`aob-badge aob-badge--fulfillment aob-badge--${order.fulfillment}`}>
          {order.fulfillment === "counter" ? "🏪 Counter" : "🚗 Delivery"}
        </span>
        {payment && (
          <span className="aob-badge" style={{ color: payment.color }}>
            {payment.icon} {payment.label}
          </span>
        )}
      </div>

      {/* GCash payment status */}
      {isGcash && (
        <button
          className={`aob-gcash-status ${gcashPaid ? "aob-gcash-status--paid" : "aob-gcash-status--unpaid"}`}
          onClick={onToggleGcash}
          title="Click to toggle GCash payment status"
        >
          {gcashPaid
            ? "✅ GCash Paid — tap to unmark"
            : "⏳ GCash Not Yet Confirmed — tap to confirm"}
        </button>
      )}

      {/* Date */}
      <p className="aob-card-date">{order.date}</p>

      {/* Delivery expand */}
      {order.fulfillment === "delivery" && order.deliveryInfo && (
        <button className="aob-expand-btn" onClick={onToggle}>
          {expanded ? "▲ Hide address" : "▼ Show address"}
        </button>
      )}
      {expanded && order.deliveryInfo && (
        <div className="aob-card-delivery">
          <div className="aob-delivery-row"><span>Name</span><span>{order.deliveryInfo.name}</span></div>
          <div className="aob-delivery-row"><span>Phone</span><span>{order.deliveryInfo.phone}</span></div>
          <div className="aob-delivery-row"><span>Address</span><span>{order.deliveryInfo.address}</span></div>
          {order.deliveryInfo.note && (
            <div className="aob-delivery-row"><span>Note</span><span>{order.deliveryInfo.note}</span></div>
          )}
        </div>
      )}

      {/* Advance button */}
      {nextLabel && (
        <button className="aob-advance-btn" onClick={onAdvance}>
          {nextLabel} →
        </button>
      )}
    </div>
  );
}
