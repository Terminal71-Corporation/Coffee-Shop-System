import { useEffect, useRef, useState } from "react";
import socket from "../services/messageService"; // src/services/messageService.js
const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminChatBox({ adminId, selectedUser }) {

  const [messages, setMessages] = useState([]);
  const [text, setText]         = useState("");
  const bottomRef               = useRef(null);

  // Register admin socket
  useEffect(() => {
    socket.emit("register", adminId);
  }, []);

  // Receive live messages
  useEffect(() => {
    socket.on("receive_message", (data) => {
      if (
        data.sender_id === selectedUser?.user_id ||
        data.receiver_id === selectedUser?.user_id
      ) {
        setMessages((prev) => [...prev, data]);
      }
    });
    return () => socket.off("receive_message");
  }, [selectedUser]);

  // Fetch conversation history
  const fetchMessages = async () => {
    if (!selectedUser) return;
    try {
      const res  = await fetch(
        `${VITE_API_URL}/api/messages/conversation/${adminId}/${selectedUser.user_id}`
      );
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) { console.log("AdminChatBox fetch error:", err); }
  };

  useEffect(() => { fetchMessages(); }, [selectedUser]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!text.trim() || !selectedUser) return;

    const newMessage = {
      sender_id:   adminId,
      receiver_id: selectedUser.user_id,
      message:     text,
    };

    // Save to database
    await fetch(`${VITE_API_URL}/api/messages/send`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(newMessage),
    });

    // Show instantly in chat
    setMessages((prev) => [...prev, newMessage]);

    // Live send to user's chat window
    socket.emit("send_message", newMessage);

    // Notify the user's notification bell
    socket.emit("admin_message_sent", {
      user_id: selectedUser.user_id,
      preview: text.trim().slice(0, 60),
    });

    setText("");
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") sendMessage(); };

  if (!selectedUser) {
    return <div className="chat-box-empty">Select a user to start chatting</div>;
  }

  return (
    <div className="admin-chat-box">

      <div className="chat-header">
        💬 Chat with <strong>{selectedUser.name}</strong>
      </div>

      <div className="chat-body">
        {messages.length === 0 && (
          <p style={{ textAlign: "center", color: "#aaa", fontSize: "13px", marginTop: "20px" }}>
            No messages yet
          </p>
        )}
        {messages.map((msg, index) => (
          <div
            key={msg.message_id || index}
            className={msg.sender_id === adminId ? "my-msg" : "their-msg"}
          >
            {msg.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={text}
          placeholder="Type message..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={sendMessage}>Send</button>
      </div>

    </div>
  );
}

export default AdminChatBox;