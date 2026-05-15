import { useEffect, useState } from "react";

function AdminChatBox({ adminId, selectedUser }) {

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const fetchMessages = async () => {
    if (!selectedUser) return; // guard

    const res = await fetch(
      `http://localhost:5000/api/messages/conversation/${adminId}/${selectedUser.user_id}`
    );
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (!selectedUser) return; // guard

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [selectedUser]);

  const sendMessage = async () => {
    if (!text.trim() || !selectedUser) return;

    await fetch("http://localhost:5000/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_id: adminId,
        receiver_id: selectedUser.user_id,
        message: text
      })
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
        Chat with {selectedUser.name}
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
      </div>

      <div className="chat-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>

    </div>
  );
}

export default AdminChatBox;
