import { useEffect, useState, useRef } from "react";
import socket from "../services/messageService";

// ── Status config ─────────────────────────────────────────────────
const COUNTER_FLOW  = ["pending_payment", "preparing", "ready", "completed"];
const DELIVERY_FLOW = ["pending_payment", "preparing", "delivering", "shipped"];

const COLUMNS = [
  { key: "pending_payment", label: "Pending Payment",    icon: "⏳", color: "#e67e22", colorBg: "rgba(230,126,34,0.10)", colorBorder: "rgba(230,126,34,0.28)", colorGlow: "rgba(230,126,34,0.18)" },
  { key: "preparing",       label: "Preparing",           icon: "☕", color: "#d4a055", colorBg: "rgba(212,160,85,0.10)", colorBorder: "rgba(212,160,85,0.25)", colorGlow: "rgba(212,160,85,0.18)" },
  { key: "ready",           label: "Ready for Pick-up",   icon: "🏪", color: "#27ae60", colorBg: "rgba(39,174,96,0.10)",  colorBorder: "rgba(39,174,96,0.25)",  colorGlow: "rgba(39,174,96,0.18)",  onlyFor: "counter" },
  { key: "delivering",      label: "Delivering",           icon: "🚗", color: "#3498db", colorBg: "rgba(52,152,219,0.10)", colorBorder: "rgba(52,152,219,0.25)", colorGlow: "rgba(52,152,219,0.18)", onlyFor: "delivery" },
  { key: "shipped",         label: "Shipped / Received",  icon: "📦", color: "#9b59b6", colorBg: "rgba(155,89,182,0.10)", colorBorder: "rgba(155,89,182,0.25)", colorGlow: "rgba(155,89,182,0.18)", onlyFor: "delivery" },
  { key: "completed",       label: "Completed",            icon: "✅", color: "#1abc9c", colorBg: "rgba(26,188,156,0.10)", colorBorder: "rgba(26,188,156,0.25)", colorGlow: "rgba(26,188,156,0.18)", onlyFor: "counter" },
  { key: "cancelled",       label: "Cancelled",            icon: "❌", color: "#e74c3c", colorBg: "rgba(231,76,60,0.10)",  colorBorder: "rgba(231,76,60,0.25)",  colorGlow: "rgba(231,76,60,0.18)",  onlyFor: "delivery" },
  { key: "voided",          label: "Voided",               icon: "🚫", color: "#e74c3c", colorBg: "rgba(231,76,60,0.10)",  colorBorder: "rgba(231,76,60,0.25)",  colorGlow: "rgba(231,76,60,0.18)" },
];

const PAYMENT_META = {
  gcash: { label: "GCash",           icon: "📱", color: "#00b4ff" },
  cash:  { label: "Cash to Counter", icon: "💵", color: "#27ae60" },
  cod:   { label: "COD",             icon: "🚗", color: "#d4a055" },
};

function getNextStatus(order) {
  if (order.status === "voided" || order.status === "cancelled") return null;
  if (order.status === "pending_payment" && order.paymentMethod === "gcash" && !order.gcashPaid) return null;
  const flow = order.fulfillment === "counter" ? COUNTER_FLOW : DELIVERY_FLOW;
  const idx = flow.indexOf(order.status);
  return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
}

function getNextLabel(nextStatus) {
  const col = COLUMNS.find((c) => c.key === nextStatus);
  return col ? `${col.icon} Mark as ${col.label}` : null;
}

function loadOrders() { return JSON.parse(localStorage.getItem("orders") || "[]"); }
function saveOrders(orders) { localStorage.setItem("orders", JSON.stringify(orders)); }

const TERMINAL = new Set(["completed", "voided", "cancelled"]);

// ── Helper: get product names from order ──
function getProductNames(order) {
  const items = order.items || [{ name: order.name }];
  const names = items.map((i) => i.name).filter(Boolean);
  if (names.length === 0) return "your order";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names[0]} and ${names.length - 1} more`;
}

export default function AdminOrdersBoard() {
  const [orders, setOrders]             = useState([]);
  const [dragId, setDragId]             = useState(null);
  const [dragOver, setDragOver]         = useState(null);
  const [expandedId, setExpandedId]     = useState(null);
  const [channel, setChannel]           = useState("counter");
  const [voidConfirmId, setVoidConfirmId] = useState(null);
  const [clearConfirm, setClearConfirm] = useState(false);
  const dragItem = useRef(null);

  useEffect(() => {
    setOrders(loadOrders());
    const onStorage = () => setOrders(loadOrders());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ── Emit socket notification to user ──
  const notifyUser = (order, newStatus) => {
    if (!order.userId) return; // order must have userId saved
    socket.emit("admin_order_status", {
      user_id:       order.userId,
      order_id:      order.orderId,
      status:        newStatus,
      product_names: getProductNames(order),
      fulfillment:   order.fulfillment || "counter",
    });
  };

  // ── Update status ──
  const updateStatus = (orderId, newStatus) => {
    const updated = orders.map((o) =>
      String(o.orderId) === String(orderId) ? { ...o, status: newStatus } : o
    );
    setOrders(updated);
    saveOrders(updated);

    // Notify the user via socket
    const order = orders.find((o) => String(o.orderId) === String(orderId));
    if (order) notifyUser(order, newStatus);
  };

  // ── Void order ──
  const voidOrder    = (orderId) => setVoidConfirmId(orderId);
  const confirmVoid  = () => {
    if (!voidConfirmId) return;
    const updated = orders.map((o) =>
      String(o.orderId) === String(voidConfirmId)
        ? { ...o, status: "voided", voidedAt: new Date().toLocaleString() }
        : o
    );
    setOrders(updated);
    saveOrders(updated);
    const order = orders.find((o) => String(o.orderId) === String(voidConfirmId));
    if (order) notifyUser(order, "voided");
    setVoidConfirmId(null);
  };
  const cancelVoid   = () => setVoidConfirmId(null);

  // ── Toggle GCash paid ──
  const toggleGcashPaid = (orderId) => {
    const updated = orders.map((o) => {
      if (String(o.orderId) !== String(orderId)) return o;
      const nowPaid = !o.gcashPaid;
      if (nowPaid && o.status === "pending_payment") {
        notifyUser(o, "preparing");
        return { ...o, gcashPaid: true, status: "preparing" };
      }
      return { ...o, gcashPaid: nowPaid };
    });
    setOrders(updated);
    saveOrders(updated);
  };

  // ── Clear terminal ──
  const confirmClear = () => {
    const updated = orders.filter((o) => {
      const matchChannel = channel === "counter"
        ? o.fulfillment === "counter" || !o.fulfillment
        : o.fulfillment === "delivery";
      return !(matchChannel && TERMINAL.has(o.status));
    });
    setOrders(updated);
    saveOrders(updated);
    setClearConfirm(false);
  };

  // ── Drag handlers ──
  const onDragStart = (e, order) => { dragItem.current = order; setDragId(order.orderId); e.dataTransfer.effectAllowed = "move"; };
  const onDragOver  = (e, colKey) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOver(colKey); };
  const onDrop      = (e, colKey) => {
    e.preventDefault(); setDragOver(null); setDragId(null);
    if (!dragItem.current) return;
    const order = dragItem.current;
    if (order.status === "voided" || order.status === "cancelled" || colKey === "voided") return;
    const flow = order.fulfillment === "counter" ? COUNTER_FLOW : DELIVERY_FLOW;
    if (!flow.includes(colKey) || order.status === colKey) return;
    updateStatus(order.orderId, colKey);
    dragItem.current = null;
  };
  const onDragEnd   = () => { setDragId(null); setDragOver(null); dragItem.current = null; };

  const channelOrders = orders
    .map((o) => o.status === "ordered" ? { ...o, status: "preparing" } : o)
    .filter((o) => channel === "counter" ? (o.fulfillment === "counter" || !o.fulfillment) : o.fulfillment === "delivery");

  const ordersForCol  = (colKey) => channelOrders.filter((o) => o.status === colKey);
  const terminalCount = channelOrders.filter((o) => TERMINAL.has(o.status)).length;
  const totalVisible  = channelOrders.length;

  const visibleCols = COLUMNS.filter((col) =>
    channel === "counter" ? !col.onlyFor || col.onlyFor === "counter" : !col.onlyFor || col.onlyFor === "delivery"
  );

  const pendingVoidOrder = voidConfirmId ? orders.find((o) => String(o.orderId) === String(voidConfirmId)) : null;

  return (
    <div className="aob-root">

      {/* Void Confirm Modal */}
      {voidConfirmId && pendingVoidOrder && (
        <div className="aob-void-overlay">
          <div className="aob-void-modal">
            <div className="aob-void-icon">🚫</div>
            <h3>Void Order?</h3>
            <p className="aob-void-order-num">{pendingVoidOrder.orderNumber || `#${String(pendingVoidOrder.orderId).slice(-5)}`}</p>
            {pendingVoidOrder.customerName && <p className="aob-void-customer"><span>👤</span> {pendingVoidOrder.customerName}</p>}
            <p className="aob-void-warning">This will cancel the order and notify the customer. This action cannot be undone.</p>
            <div className="aob-void-actions">
              <button className="aob-void-confirm-btn" onClick={confirmVoid}>Yes, Void Order</button>
              <button className="aob-void-cancel-btn" onClick={cancelVoid}>Keep Order</button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirm Modal */}
      {clearConfirm && (
        <div className="aob-void-overlay">
          <div className="aob-void-modal">
            <div className="aob-void-icon">🗑️</div>
            <h3>Clear Orders?</h3>
            <p className="aob-void-order-num">{channel === "counter" ? "🏪 Store / Counter" : "🚚 Online / Delivery"}</p>
            <p className="aob-void-warning">This will permanently remove all <strong>completed</strong>, <strong>voided</strong>, and <strong>cancelled</strong> orders. Active orders will not be affected.</p>
            <div className="aob-void-actions">
              <button className="aob-void-confirm-btn" onClick={confirmClear}>🗑️ Yes, Clear {terminalCount} Order{terminalCount !== 1 ? "s" : ""}</button>
              <button className="aob-void-cancel-btn" onClick={() => setClearConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="aob-toolbar">
        <div className="aob-channel-switcher">
          <button className={`aob-channel-btn ${channel === "counter" ? "active" : ""}`} onClick={() => setChannel("counter")}>🏪 Store / Counter</button>
          <button className={`aob-channel-btn ${channel === "delivery" ? "active" : ""}`} onClick={() => setChannel("delivery")}>🚚 Online / Delivery</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {terminalCount > 0 && <button className="aob-clear-btn" onClick={() => setClearConfirm(true)}>🗑️ Clear {terminalCount}</button>}
          <div className="aob-total-pill">{totalVisible} order{totalVisible !== 1 ? "s" : ""}</div>
        </div>
      </div>

      {/* Board */}
      <div className="aob-board">
        {visibleCols.map((col) => {
          const colOrders = ordersForCol(col.key);
          const isOver    = dragOver === col.key;
          return (
            <div
              key={col.key}
              className={`aob-column ${isOver ? "aob-column--over" : ""}`}
              style={{ "--col-color": col.color, "--col-bg": col.colorBg, "--col-border": col.colorBorder, "--col-glow": col.colorGlow }}
              onDragOver={(e) => onDragOver(e, col.key)}
              onDrop={(e) => onDrop(e, col.key)}
              onDragLeave={() => setDragOver(null)}
            >
              <div className="aob-col-header">
                <span className="aob-col-icon">{col.icon}</span>
                <span className="aob-col-label">{col.label}</span>
                <span className="aob-col-count">{colOrders.length}</span>
              </div>
              {isOver && <div className="aob-drop-hint">Drop here</div>}
              <div className="aob-cards">
                {colOrders.length === 0 && !isOver && <div className="aob-empty-col">No orders</div>}
                {colOrders.map((order) => (
                  <OrderCard
                    key={order.orderId}
                    order={order}
                    col={col}
                    isDragging={dragId === order.orderId}
                    expanded={expandedId === order.orderId}
                    onToggle={() => setExpandedId((p) => p === order.orderId ? null : order.orderId)}
                    onAdvance={() => { const next = getNextStatus(order); if (next) updateStatus(order.orderId, next); }}
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

function OrderCard({ order, col, isDragging, expanded, onToggle, onAdvance, onToggleGcash, onVoid, onDragStart, onDragEnd }) {
  const next      = getNextStatus(order);
  const nextLabel = next ? getNextLabel(next) : null;
  const payment   = PAYMENT_META[order.paymentMethod] || null;
  const isVoided  = order.status === "voided";
  const isCancelled = order.status === "cancelled";
  const isTerminal  = isVoided || isCancelled;
  const isPendingPayment = order.status === "pending_payment";
  const isGcash   = order.paymentMethod === "gcash";
  const gcashPaid = order.gcashPaid === true;

  const items = order.items || [{ name: order.name, price: order.price, quantity: order.quantity, image_url: order.image_url, addons: order.addons }];
  const grandTotal = order.total
    ? parseFloat(order.total).toFixed(2)
    : items.reduce((sum, item) => sum + parseFloat(item.price || 0) * (item.quantity || 1), 0).toFixed(2);

  return (
    <div
      className={`aob-card ${isDragging ? "aob-card--dragging" : ""} ${isTerminal ? "aob-card--voided" : ""}`}
      draggable={!isTerminal}
      onDragStart={(e) => !isTerminal && onDragStart(e, order)}
      onDragEnd={onDragEnd}
      style={{ "--col-color": col.color, "--col-border": col.colorBorder, "--col-bg": col.colorBg }}
    >
      {!isTerminal && <div className="aob-drag-handle" title="Drag to move">⠿</div>}
      {isVoided    && <div className="aob-void-ribbon">🚫 VOIDED</div>}
      {isCancelled && <div className="aob-void-ribbon" style={{ color: "#e74c3c", borderColor: "rgba(231,76,60,0.3)" }}>❌ CANCELLED BY CUSTOMER</div>}
      {isPendingPayment && isGcash && !gcashPaid && <div className="aob-pending-ribbon">⏳ AWAITING GCASH PAYMENT</div>}

      <div className="aob-card-header-row">
        {order.orderNumber && <span className="aob-order-number">{order.orderNumber}</span>}
        {order.customerName && <div className="aob-customer-name"><span className="aob-customer-icon">👤</span>{order.customerName}</div>}
      </div>

      {isPendingPayment && isGcash && order.gcashRef && (
        <div className="aob-gcash-ref-display">
          <span className="aob-gcash-ref-label-small">📋 GCash Ref #</span>
          <span className="aob-gcash-ref-value">{order.gcashRef}</span>
        </div>
      )}

      <div className="aob-items-list">
        {items.map((item, idx) => {
          const imgSrc = item.image_url && item.image_url.trim() ? item.image_url : "https://via.placeholder.com/40x40?text=?";
          const subtotal = (parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2);
          return (
            <div key={item.cartId || idx} className="aob-item-row">
              <img src={imgSrc} className="aob-card-img" alt={item.name} onError={(e) => { e.target.src = "https://via.placeholder.com/40x40?text=?"; }} />
              <div className="aob-card-info">
                <p className="aob-card-name">{item.name}</p>
                {item.addons && <p className="aob-card-addons">+{item.addons}</p>}
                <p className="aob-card-subtotal">₱{subtotal} <span className="aob-card-qty">×{item.quantity || 1}</span></p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="aob-card-grand-total"><span>Total</span><span>₱{grandTotal}</span></div>

      <div className="aob-card-badges">
        <span className={`aob-badge aob-badge--fulfillment aob-badge--${order.fulfillment}`}>
          {order.fulfillment === "counter" ? "🏪 Counter" : "🚗 Delivery"}
        </span>
        {payment && <span className="aob-badge" style={{ color: payment.color }}>{payment.icon} {payment.label}</span>}
      </div>

      {isGcash && !isTerminal && (
        <button className={`aob-gcash-status ${gcashPaid ? "aob-gcash-status--paid" : "aob-gcash-status--unpaid"}`} onClick={onToggleGcash}>
          {gcashPaid ? "✅ GCash Confirmed — tap to unmark" : "⏳ GCash Not Yet Confirmed — tap to confirm"}
        </button>
      )}

      <p className="aob-card-date">{order.date}</p>
      {isVoided && order.voidedAt && <p className="aob-card-date" style={{ color: "rgba(231,76,60,0.6)" }}>Voided: {order.voidedAt}</p>}

      {order.fulfillment === "delivery" && order.deliveryInfo && (
        <button className="aob-expand-btn" onClick={onToggle}>{expanded ? "▲ Hide address" : "▼ Show address"}</button>
      )}
      {expanded && order.deliveryInfo && (
        <div className="aob-card-delivery">
          <div className="aob-delivery-row"><span>Name</span><span>{order.deliveryInfo.name}</span></div>
          <div className="aob-delivery-row"><span>Phone</span><span>{order.deliveryInfo.phone}</span></div>
          <div className="aob-delivery-row"><span>Address</span><span>{order.deliveryInfo.address}</span></div>
          {order.deliveryInfo.note && <div className="aob-delivery-row"><span>Note</span><span>{order.deliveryInfo.note}</span></div>}
        </div>
      )}

      {!isTerminal && (
        <div className="aob-card-actions">
          {isPendingPayment && isGcash && !gcashPaid ? (
            <div className="aob-locked-hint">🔒 Confirm GCash payment above to advance this order</div>
          ) : (
            nextLabel && <button className="aob-advance-btn" onClick={onAdvance}>{nextLabel} →</button>
          )}
          <button className="aob-void-btn" onClick={onVoid}>🚫 Void Order</button>
        </div>
      )}
    </div>
  );
}