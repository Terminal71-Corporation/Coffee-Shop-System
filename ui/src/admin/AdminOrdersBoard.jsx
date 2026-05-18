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
  {
    key: "voided",
    label: "Voided",
    icon: "🚫",
    color: "#e74c3c",
    colorBg: "rgba(231,76,60,0.10)",
    colorBorder: "rgba(231,76,60,0.25)",
    colorGlow: "rgba(231,76,60,0.18)",
  },
];

const PAYMENT_META = {
  gcash: { label: "GCash",            icon: "📱", color: "#00b4ff" },
  cash:  { label: "Cash to Counter",  icon: "💵", color: "#27ae60" },
  cod:   { label: "COD",              icon: "🚗", color: "#d4a055" },
};

// ── Helpers ───────────────────────────────────────────────────────
function getNextStatus(order) {
  if (order.status === "voided") return null;
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
  const [voidConfirmId, setVoidConfirmId] = useState(null); // order pending void confirmation
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

  // ── Void / Cancel order ──
  const voidOrder = (orderId) => {
    setVoidConfirmId(orderId);
  };

  const confirmVoid = () => {
    if (!voidConfirmId) return;
    const updated = orders.map((o) =>
      String(o.orderId) === String(voidConfirmId)
        ? { ...o, status: "voided", voidedAt: new Date().toLocaleString() }
        : o
    );
    setOrders(updated);
    saveOrders(updated);
    setVoidConfirmId(null);
  };

  const cancelVoid = () => setVoidConfirmId(null);

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
    if (order.status === "voided" || colKey === "voided") return; // can't drag to/from voided
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

  const pendingVoidOrder = voidConfirmId
    ? orders.find((o) => String(o.orderId) === String(voidConfirmId))
    : null;

  return (
    <div className="aob-root">

      {/* ── Void Confirm Modal ── */}
      {voidConfirmId && pendingVoidOrder && (
        <div className="aob-void-overlay">
          <div className="aob-void-modal">
            <div className="aob-void-icon">🚫</div>
            <h3>Void Order?</h3>
            <p className="aob-void-order-num">
              {pendingVoidOrder.orderNumber || `#${String(pendingVoidOrder.orderId).slice(-5)}`}
            </p>
            <p className="aob-void-customer">
              {pendingVoidOrder.customerName && (
                <><span>👤</span> {pendingVoidOrder.customerName}</>
              )}
            </p>
            <p className="aob-void-warning">
              This will cancel the order and notify the customer. This action cannot be undone.
            </p>
            <div className="aob-void-actions">
              <button className="aob-void-confirm-btn" onClick={confirmVoid}>
                Yes, Void Order
              </button>
              <button className="aob-void-cancel-btn" onClick={cancelVoid}>
                Keep Order
              </button>
            </div>
          </div>
        </div>
      )}

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
                    onVoid={() => voidOrder(order.orderId)}
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
function OrderCard({ order, col, isDragging, expanded, onToggle, onAdvance, onToggleGcash, onVoid, onDragStart, onDragEnd }) {
  const next = getNextStatus(order);
  const nextLabel = next ? getNextLabel(next) : null;
  const payment = PAYMENT_META[order.paymentMethod] || null;
  const isVoided = order.status === "voided";

  // Support both grouped items[] and legacy single-item orders
  const items = order.items || [{
    name: order.name,
    price: order.price,
    quantity: order.quantity,
    image_url: order.image_url,
    addons: order.addons,
  }];

  const grandTotal = order.total
    ? parseFloat(order.total).toFixed(2)
    : items.reduce((sum, item) => sum + parseFloat(item.price || 0) * (item.quantity || 1), 0).toFixed(2);

  const isGcash = order.paymentMethod === "gcash";
  const gcashPaid = order.gcashPaid === true;

  return (
    <div
      className={`aob-card ${isDragging ? "aob-card--dragging" : ""} ${isVoided ? "aob-card--voided" : ""}`}
      draggable={!isVoided}
      onDragStart={(e) => !isVoided && onDragStart(e, order)}
      onDragEnd={onDragEnd}
      style={{ "--col-color": col.color, "--col-border": col.colorBorder, "--col-bg": col.colorBg }}
    >
      {/* Drag handle */}
      {!isVoided && <div className="aob-drag-handle" title="Drag to move">⠿</div>}

      {/* Void ribbon */}
      {isVoided && (
        <div className="aob-void-ribbon">🚫 VOIDED</div>
      )}

      {/* Order number + customer */}
      <div className="aob-card-header-row">
        {order.orderNumber && (
          <span className="aob-order-number">{order.orderNumber}</span>
        )}
        {order.customerName && (
          <div className="aob-customer-name">
            <span className="aob-customer-icon">👤</span>
            {order.customerName}
          </div>
        )}
      </div>

      {/* Items list */}
      <div className="aob-items-list">
        {items.map((item, idx) => {
          const imgSrc =
            item.image_url && item.image_url.trim()
              ? item.image_url
              : "https://via.placeholder.com/40x40?text=?";
          const subtotal = (parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2);

          return (
            <div key={item.cartId || idx} className="aob-item-row">
              <img
                src={imgSrc}
                className="aob-card-img"
                alt={item.name}
                onError={(e) => { e.target.src = "https://via.placeholder.com/40x40?text=?"; }}
              />
              <div className="aob-card-info">
                <p className="aob-card-name">{item.name}</p>
                {item.addons && <p className="aob-card-addons">+{item.addons}</p>}
                <p className="aob-card-subtotal">
                  ₱{subtotal} <span className="aob-card-qty">×{item.quantity || 1}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grand total */}
      <div className="aob-card-grand-total">
        <span>Total</span>
        <span>₱{grandTotal}</span>
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
      {isGcash && !isVoided && (
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
      {isVoided && order.voidedAt && (
        <p className="aob-card-date" style={{ color: "rgba(231,76,60,0.6)" }}>
          Voided: {order.voidedAt}
        </p>
      )}

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

      {/* Action buttons */}
      {!isVoided && (
        <div className="aob-card-actions">
          {nextLabel && (
            <button className="aob-advance-btn" onClick={onAdvance}>
              {nextLabel} →
            </button>
          )}
          <button className="aob-void-btn" onClick={onVoid} title="Cancel / Void this order">
            🚫 Void Order
          </button>
        </div>
      )}
    </div>
  );
}
