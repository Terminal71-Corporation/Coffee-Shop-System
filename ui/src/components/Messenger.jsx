import { useEffect, useRef, useState } from "react";
import "./Messenger.css";

const ADMIN_ID = 1;

function Messenger({ userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  const fetchMessages = async () => {
    if (!userId) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/messages/conversation/${userId}/${ADMIN_ID}`
      );
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!isOpen || !userId) return;

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [isOpen, userId]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !userId) return;

    await fetch("http://localhost:5000/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_id: userId,
        receiver_id: ADMIN_ID,
        message: text,
      }),
    });

    setText("");
    fetchMessages();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  if (!userId) return null;

  return (
    <div className="messenger-widget">

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="messenger-box">

          <div className="messenger-header">
            <span>💬 Chat with Support</span>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="messenger-body">
            {messages.length === 0 && (
              <p className="messenger-empty">Send us a message!</p>
            )}

            {messages.map((msg) => (
              <div
                key={msg.message_id}
                className={msg.sender_id === userId ? "msg-mine" : "msg-theirs"}
              >
                {msg.message}
              </div>
            ))}

            <div ref={bottomRef} />
          </div>

          <div className="messenger-input">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>

        </div>
      )}

      {/* TOGGLE BUTTON */}
      <button
        className="messenger-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        💬
      </button>

    </div>
  );
}

export default Messenger;
