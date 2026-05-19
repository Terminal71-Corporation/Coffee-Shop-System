import { useEffect, useRef, useState } from "react";

function AdminChatBox({ adminId, selectedUser }) {

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  const fetchMessages = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/messages/conversation/${adminId}/${selectedUser.user_id}`
      );
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("AdminChatBox fetch error:", err);
    }
  };

  useEffect(() => {
    if (!selectedUser) return;

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [selectedUser]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !selectedUser) return;

    await fetch("http://localhost:5000/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_id: adminId,
        receiver_id: selectedUser.user_id,
        message: text,
      }),
    });

    setText("");
    fetchMessages();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  if (!selectedUser) {
    return (
      <div className="chat-box-empty">
        Select a user to start chatting
      </div>
    );
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
        {messages.map((msg) => (
          <div
            key={msg.message_id}
            className={msg.sender_id === adminId ? "my-msg" : "their-msg"}
          >
            {msg.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>

    </div>
  );
}

export default AdminChatBox;