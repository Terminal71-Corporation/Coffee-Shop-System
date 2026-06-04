import { useEffect, useRef, useState } from "react";
import "./Messenger.css";
import socket from "../services/messageService";
const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ADMIN_ID = 1;

function Messenger({ userId }) {
  const [isOpen,      setIsOpen]      = useState(false);
  const [messages,    setMessages]    = useState([]);
  const [text,        setText]        = useState("");
  const [unreadCount, setUnreadCount] = useState(0);  // 🔴 badge
  const bottomRef = useRef(null);

  // REGISTER USER
  useEffect(() => {
    if (userId) socket.emit("register", userId);
  }, [userId]);

  // RECEIVE LIVE MESSAGE
  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
      // Only count badge when chat is closed
      setIsOpen((open) => {
        if (!open) setUnreadCount((c) => c + 1);
        return open;
      });
    });
    return () => socket.off("receive_message");
  }, []);

  // LISTEN FOR BELL → OPEN MESSENGER (from NotificationBell click)
  useEffect(() => {
    const handler = () => { setIsOpen(true); setUnreadCount(0); };
    window.addEventListener("toggle-messenger", handler);
    return () => window.removeEventListener("toggle-messenger", handler);
  }, []);

  // FETCH OLD MESSAGES
  const fetchMessages = async () => {
    try {
      const res  = await fetch(`${VITE_API_URL}/api/messages/conversation/${userId}/${ADMIN_ID}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      setUnreadCount(0); // clear badge on open
    }
  }, [isOpen]);

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!text.trim()) return;
    const newMessage = { sender_id: userId, receiver_id: ADMIN_ID, message: text };

    await fetch(`${VITE_API_URL}/api/messages/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMessage),
    });

    setMessages((prev) => [...prev, newMessage]);
    socket.emit("send_message", newMessage);
    setText("");
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") sendMessage(); };

  if (!userId) return null;

  return (
    <div className="messenger-widget">
      {isOpen && (
        <div className="messenger-box">
          <div className="messenger-header">
            <span>💬 Chat with Support</span>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="messenger-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={msg.sender_id === userId ? "msg-mine" : "msg-theirs"}
              >
                {msg.message}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="messenger-input">
            <input
              type="text"
              value={text}
              placeholder="Type a message..."
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}

      {/* Toggle button WITH unread badge */}
      <button
        className="messenger-toggle"
        onClick={() => { setIsOpen((o) => !o); setUnreadCount(0); }}
      >
        💬
        {unreadCount > 0 && (
          <span className="messenger-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}

export default Messenger;