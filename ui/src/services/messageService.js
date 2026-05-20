import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});

export default socket;

// ── Message API helpers ──
const API = "http://localhost:5000/api/messages";

export const sendMessage = async (data) => {
  const res = await fetch(`${API}/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getConversation = async (user1, user2) => {
  const res = await fetch(`${API}/conversation/${user1}/${user2}`);
  return res.json();
};