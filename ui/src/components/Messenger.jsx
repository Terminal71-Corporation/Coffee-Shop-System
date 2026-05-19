import { useEffect, useRef, useState } from "react";
import "./Messenger.css";
import socket from "../socket";

const ADMIN_ID = 1;

function Messenger({ userId }) {

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const bottomRef = useRef(null);

  // REGISTER USER
  useEffect(() => {
    if (userId) {
      socket.emit("register", userId);
    }
  }, [userId]);

  // RECEIVE LIVE MESSAGE
  useEffect(() => {

    socket.on("receive_message", (data) => {

      setMessages((prev) => [...prev, data]);

    });

    return () => {
      socket.off("receive_message");
    };

  }, []);

  // FETCH OLD MESSAGES
  const fetchMessages = async () => {

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

    if (isOpen) {
      fetchMessages();
    }

  }, [isOpen]);

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);

  // SEND MESSAGE
  const sendMessage = async () => {

    if (!text.trim()) return;

    const newMessage = {
      sender_id: userId,
      receiver_id: ADMIN_ID,
      message: text,
    };

    // SAVE TO DATABASE
    await fetch("http://localhost:5000/api/messages/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newMessage)
    });

    // SHOW IN UI INSTANTLY
    setMessages((prev) => [...prev, newMessage]);

    // SEND LIVE
    socket.emit("send_message", newMessage);

    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  if (!userId) return null;

  return (
    <div className="messenger-widget">

      {isOpen && (
        <div className="messenger-box">

          <div className="messenger-header">

            <span>💬 Chat with Support</span>

            <button onClick={() => setIsOpen(false)}>
              ✕
            </button>

          </div>

          <div className="messenger-body">

            {messages.map((msg, index) => (

              <div
                key={index}
                className={
                  msg.sender_id === userId
                    ? "msg-mine"
                    : "msg-theirs"
                }
              >
                {msg.message}
              </div>

            ))}

            <div ref={bottomRef}></div>

          </div>

          <div className="messenger-input">

            <input
              type="text"
              value={text}
              placeholder="Type a message..."
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <button onClick={sendMessage}>
              Send
            </button>

          </div>

        </div>
      )}

      <button
        className="messenger-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        💬
      </button>

    </div>
  );
}

export default Messenger;