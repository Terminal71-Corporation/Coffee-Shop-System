const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// ── Route imports ──
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
// add any other route files you have

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Export io so controllers can emit events
module.exports.io = io;

app.use(cors());
app.use(express.json({ limit: "10mb" }));    // limit needed for base64 images
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Routes ──
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/api/messages", messageRoutes);

// ── Socket.IO ──
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Admin adds a product → broadcast to ALL clients as "new_product"
  socket.on("admin_new_product", (data) => {
    io.emit("new_product", data);
  });

  // Admin sends a message notification → broadcast to target user
  socket.on("admin_message", (data) => {
    io.emit("new_message", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));