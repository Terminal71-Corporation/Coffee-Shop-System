import { useEffect, useRef, useState } from "react";
import socket from "../services/messageService";
import "./NotificationBell.css";

function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`notifs_${userId}`) || "[]"); }
    catch { return []; }
  });
  const [toasts, setToasts]   = useState([]);
  const [isOpen, setIsOpen]   = useState(false);
  const panelRef              = useRef(null);

  const unread = notifications.filter((n) => !n.read).length;

  // Persist per-user
  useEffect(() => {
    if (!userId) return;
    localStorage.setItem(`notifs_${userId}`, JSON.stringify(notifications));
  }, [notifications, userId]);

  // ── Add a notification + show a toast ──
  const push = (notif) => {
    const entry = { ...notif, id: Date.now() + Math.random(), read: false, time: new Date().toISOString() };

    setNotifications((prev) => [entry, ...prev].slice(0, 50));

    // Toast
    const toastId = entry.id;
    setToasts((prev) => [...prev, { ...entry, toastId }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
    }, 5000);
  };

  // ── Socket listeners ──
  useEffect(() => {
    if (!userId) return;

    // Register this user in their socket room
    socket.emit("register_user", userId);

    // 1. New product
    socket.on("new_product", (data) => {
      push({
        type:    "product",
        icon:    "☕",
        title:   "New Product Available!",
        message: `The newest product "${data.name}" is now available for ₱${data.price}. Check it out!`,
        link:    "/products",
      });
    });

    // 2. Order status update
    socket.on("order_status_update", (data) => {
      const productNames = data.product_names || "your order";
      const isDelivery   = data.fulfillment === "delivery";

      const statusMap = {
        preparing: {
          icon:  "☕",
          title: "Order is Being Prepared!",
          message: `Thank you for ordering ${productNames}! Our baristas are crafting your order now. Estimated preparation time is 10 minutes${isDelivery ? " + delivery time" : ""}. We'll notify you when it's ready!`,
        },
        ready: {
          icon:  "🏪",
          title: "Order Ready for Pick-up!",
          message: `Your order (${productNames}) is ready! Please proceed to the counter to pick it up. 😊`,
        },
        delivering: {
          icon:  "🚗",
          title: "Your Order is On Its Way!",
          message: `Great news! ${productNames} is out for delivery. Our rider is heading your way — estimated arrival in 20-40 minutes!`,
        },
        shipped: {
          icon:  "📦",
          title: "Order Delivered!",
          message: `Your order (${productNames}) has been delivered. Enjoy your coffee! ☕ Thank you for ordering with us!`,
        },
        completed: {
          icon:  "✅",
          title: "Order Completed!",
          message: `Your order (${productNames}) is marked as completed. Thank you for choosing us! Come back soon. 😊`,
        },
        voided: {
          icon:  "🚫",
          title: "Order Cancelled",
          message: `Unfortunately, your order (${productNames}) has been cancelled. Please contact us if you have questions.`,
        },
        cancelled: {
          icon:  "❌",
          title: "Order Cancelled",
          message: `Your order (${productNames}) has been cancelled. If you paid via GCash, please contact us for a refund.`,
        },
        pending_payment: {
          icon:  "⏳",
          title: "Order Received — Awaiting Payment",
          message: `We received your order for ${productNames}! Please complete your payment so we can start preparing it.`,
        },
      };

      const s = statusMap[data.status] || {
        icon: "📋", title: "Order Update",
        message: `Your order (${productNames}) status has been updated to: ${data.status}.`,
      };

      push({ type: "order", icon: s.icon, title: s.title, message: s.message, link: "/orders" });
    });

    // 3. Admin message
    socket.on("new_admin_message", (data) => {
      push({
        type:    "message",
        icon:    "💬",
        title:   "New Message from Support",
        message: data.preview ? `"${data.preview}"` : "You have a new message from our support team.",
        link:    null, // triggers messenger toggle
        isChat:  true,
      });
    });

    return () => {
      socket.off("new_product");
      socket.off("order_status_update");
      socket.off("new_admin_message");
    };
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  const clearAll    = () => { setNotifications([]); localStorage.removeItem(`notifs_${userId}`); };

  const handleNotifClick = (n) => {
    if (n.isChat) window.dispatchEvent(new CustomEvent("toggle-messenger"));
    else if (n.link) window.location.href = n.link;
  };

  const timeAgo = (iso) => {
    try {
      const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
      if (diff < 60)   return "just now";
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
      return new Date(iso).toLocaleDateString();
    } catch { return ""; }
  };

  return (
    <>
      {/* ── Toast stack (top-right, Facebook style) ── */}
      <div className="notif-toast-stack">
        {toasts.map((t) => (
          <div
            key={t.toastId}
            className={`notif-toast notif-toast--${t.type}`}
            onClick={() => handleNotifClick(t)}
          >
            <span className="notif-toast-icon">{t.icon}</span>
            <div className="notif-toast-body">
              <div className="notif-toast-title">{t.title}</div>
              <div className="notif-toast-msg">{t.message}</div>
            </div>
            <button
              className="notif-toast-close"
              onClick={(e) => { e.stopPropagation(); setToasts((p) => p.filter((x) => x.toastId !== t.toastId)); }}
            >✕</button>
          </div>
        ))}
      </div>

      {/* ── Bell + Dropdown ── */}
      <div className="notif-wrapper" ref={panelRef}>
        <button
          className="notif-bell"
          onClick={() => { setIsOpen((p) => !p); if (!isOpen) markAllRead(); }}
          title="Notifications"
        >
          🔔
          {unread > 0 && <span className="notif-badge">{unread > 9 ? "9+" : unread}</span>}
        </button>

        {isOpen && (
          <div className="notif-panel">
            <div className="notif-panel-header">
              <span>Notifications</span>
              {notifications.length > 0 && (
                <button className="notif-clear-btn" onClick={clearAll}>Clear all</button>
              )}
            </div>
            <div className="notif-list">
              {notifications.length === 0 ? (
                <div className="notif-empty">🔔 No notifications yet</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notif-item ${n.read ? "notif-read" : "notif-unread"}`}
                    onClick={() => handleNotifClick(n)}
                  >
                    <span className="notif-icon">{n.icon}</span>
                    <div className="notif-content">
                      <div className="notif-title">{n.title}</div>
                      <div className="notif-message">{n.message}</div>
                      <div className="notif-time">{timeAgo(n.time)}</div>
                    </div>
                    {!n.read && <div className="notif-dot" />}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default NotificationBell;