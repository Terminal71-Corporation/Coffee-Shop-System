import { io } from "socket.io-client";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const socket = io(BASE_URL, {
  transports: ["websocket"],
});

export default socket;

// ── Message API helpers ──
const API = `${BASE_URL}/api/messages`

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
