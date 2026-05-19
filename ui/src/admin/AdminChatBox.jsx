import { useEffect, useRef, useState } from "react";
import socket from "../socket";

function AdminChatBox({ adminId, selectedUser }) {

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const bottomRef = useRef(null);

  // REGISTER ADMIN
  useEffect(() => {

    socket.emit("register", adminId);

  }, []);

  // RECEIVE LIVE
  useEffect(() => {

    socket.on("receive_message", (data) => {

      if (
        data.sender_id === selectedUser?.user_id ||
        data.receiver_id === selectedUser?.user_id
      ) {
        setMessages((prev) => [...prev, data]);
      }

    });

    return () => {
      socket.off("receive_message");
    };

  }, [selectedUser]);

  // FETCH CONVERSATION
  const fetchMessages = async () => {

    if (!selectedUser) return;

    const res = await fetch(
      `http://localhost:5000/api/messages/conversation/${adminId}/${selectedUser.user_id}`
    );

    const data = await res.json();

    setMessages(data);
  };

  useEffect(() => {

    fetchMessages();

  }, [selectedUser]);

  // AUTO SCROLL
  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });

  }, [messages]);

  // SEND
  const sendMessage = async () => {

    if (!text.trim()) return;

    const newMessage = {
      sender_id: adminId,
      receiver_id: selectedUser.user_id,
      message: text
    };

    // SAVE DATABASE
    await fetch("http://localhost:5000/api/messages/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newMessage)
    });

    // SHOW INSTANTLY
    setMessages((prev) => [...prev, newMessage]);

    // LIVE SEND
    socket.emit("send_message", newMessage);

    setText("");
  };

  const handleKeyDown = (e) => {

    if (e.key === "Enter") {
      sendMessage();
    }

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

        {messages.map((msg, index) => (

          <div
            key={index}
            className={
              msg.sender_id === adminId
                ? "my-msg"
                : "their-msg"
            }
          >
            {msg.message}
          </div>

        ))}

        <div ref={bottomRef}></div>

      </div>

      <div className="chat-input">

        <input
          type="text"
          value={text}
          placeholder="Type message..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button onClick={sendMessage}>
          Send
        </button>

      </div>

    </div>
  );
}

export default AdminChatBox;