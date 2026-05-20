const express = require("express");
const http    = require("http");
const { Server } = require("socket.io");
const cors    = require("cors");

const authRoutes    = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes    = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
});

module.exports.io = io;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/auth",         authRoutes);
app.use("/products",     productRoutes);
app.use("/users",        userRoutes);
app.use("/api/messages", messageRoutes);

// Track connected users: userId → socketId
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // ── EXISTING: register user for chat ──
  socket.on("register", (userId) => {
    onlineUsers[userId] = socket.id;
    // Also join a room for targeted notifications
    socket.join(`user_${userId}`);
    console.log(`User ${userId} registered (socket: ${socket.id})`);
  });

  // ── EXISTING: user joins their notification room by userId ──
  socket.on("register_user", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined notification room`);
  });

  // ── EXISTING: live chat message (admin ↔ user) ──
  socket.on("send_message", (data) => {
    const targetSocketId = onlineUsers[data.receiver_id];
    if (targetSocketId) {
      io.to(targetSocketId).emit("receive_message", data);
    }
    console.log(`Message from ${data.sender_id} → ${data.receiver_id}`);
  });

  // ── NEW: Admin adds a new product → notify ALL users ──
  socket.on("admin_new_product", (data) => {
    // Broadcast to everyone except the sender (admin)
    socket.broadcast.emit("new_product", data);
    console.log("New product broadcast:", data.name);
  });

  // ── NEW: Admin updates order status → notify specific user ──
  socket.on("admin_order_status", (data) => {
    io.to(`user_${data.user_id}`).emit("order_status_update", data);
    console.log(`Order status (${data.status}) sent to user_${data.user_id}`);
  });

  // ── NEW: Admin sends message → notify user's bell ──
  socket.on("admin_message_sent", (data) => {
    io.to(`user_${data.user_id}`).emit("new_admin_message", data);
    console.log(`Message notification sent to user_${data.user_id}`);
  });

  socket.on("disconnect", () => {
    // Remove from onlineUsers
    for (const [uid, sid] of Object.entries(onlineUsers)) {
      if (sid === socket.id) { delete onlineUsers[uid]; break; }
    }
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));