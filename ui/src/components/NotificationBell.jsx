import { useEffect, useRef, useState } from "react";
import socket from "../services/messageService";
import "./NotificationBell.css";

function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState(() => {
    // Persist notifications across page refreshes
    try {
      return JSON.parse(localStorage.getItem("notifications") || "[]");
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Save to localStorage whenever notifications change
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (notif) => {
    setNotifications((prev) => {
      const updated = [{ ...notif, id: Date.now(), read: false, time: new Date().toISOString() }, ...prev].slice(0, 50);
      return updated;
    });
  };

  useEffect(() => {
    if (!userId) return;

    // ── New product added by admin ──
    socket.on("new_product", (data) => {
      addNotification({
        type: "product",
        icon: "☕",
        title: "New Product!",
        message: `${data.name} is now available for ₱${data.price}`,
      });
    });

    // ── Order status update (only for this user) ──
    socket.on("order_status_update", (data) => {
      if (String(data.user_id) !== String(userId)) return;

      const statusMessages = {
        pending:    { icon: "🕐", title: "Order Received",    msg: `Your order #${data.order_id} has been received!` },
        preparing:  { icon: "☕", title: "Order Preparing",   msg: `Your order #${data.order_id} is being prepared.` },
        delivering: { icon: "🚚", title: "Out for Delivery",  msg: `Your order #${data.order_id} is on its way!` },
        shipped:    { icon: "📦", title: "Order Shipped",     msg: `Your order #${data.order_id} has been shipped.` },
        completed:  { icon: "✅", title: "Order Completed",   msg: `Your order #${data.order_id} has been delivered!` },
        voided:     { icon: "❌", title: "Order Cancelled",   msg: `Your order #${data.order_id} was cancelled.` },
      };

      const s = statusMessages[data.status] || {
        icon: "📋", title: "Order Update",
        msg: `Your order #${data.order_id} status: ${data.status}`,
      };

      addNotification({
        type: "order",
        icon: s.icon,
        title: s.title,
        message: s.msg,
      });
    });

    return () => {
      socket.off("new_product");
      socket.off("order_status_update");
    };
  }, [userId]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem("notifications");
  };

  const formatTime = (iso) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diff = Math.floor((now - d) / 1000);
      if (diff < 60) return "just now";
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return d.toLocaleDateString();
    } catch {
      return "";
    }
  };

  return (
    <div className="notif-wrapper" ref={panelRef}>
      {/* Bell button */}
      <button
        className="notif-bell"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) markAllRead();
        }}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {/* Dropdown panel */}
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
              <div className="notif-empty">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`notif-item ${n.read ? "notif-read" : "notif-unread"}`}>
                  <span className="notif-icon">{n.icon}</span>
                  <div className="notif-content">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-message">{n.message}</div>
                    <div className="notif-time">{formatTime(n.time)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;