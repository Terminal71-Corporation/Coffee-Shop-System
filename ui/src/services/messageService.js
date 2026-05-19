import { io } from "socket.io-client";

const API = "http://localhost:5000/api/messages";

// ============================
// SOCKET CONNECTION
// ============================

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});

export default socket;

// ============================
// SEND MESSAGE
// ============================

export const sendMessage = async (data) => {
  const res = await fetch(`${API}/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

// ============================
// GET CONVERSATION
// ============================

export const getConversation = async (user1, user2) => {
  const res = await fetch(
    `${API}/conversation/${user1}/${user2}`
  );

  return res.json();
};