const express = require("express");
const cors = require("cors");
const http = require("http");

const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

app.use(cors());
app.use(express.json());


// ======================
// ROUTES
// ======================

app.use("/api/messages", messageRoutes);
app.use("/categories", categoryRoutes);
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/users", userRoutes);


// ======================
// TEST ROUTE
// ======================

app.get("/", (req, res) => {
  res.send("Coffee Shop API Running ☕");
});


// ======================
// SOCKET SERVER
// ======================

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});


// ======================
// ONLINE USERS
// ======================

const users = {};


// ======================
// SOCKET CONNECTION
// ======================

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);


  // REGISTER USER
  socket.on("register", (userId) => {

    users[userId] = socket.id;

    console.log("ONLINE USERS:", users);

  });


  // SEND LIVE MESSAGE
  socket.on("send_message", (data) => {

    const receiverSocketId = users[data.receiver_id];

    if (receiverSocketId) {

      io.to(receiverSocketId).emit(
        "receive_message",
        data
      );

    }

  });


  // DISCONNECT
  socket.on("disconnect", () => {

    console.log("User disconnected");

    for (let id in users) {

      if (users[id] === socket.id) {

        delete users[id];

      }

    }

  });

});


// ======================
// START SERVER
// ======================

const PORT = 5000;

server.listen(PORT, () => {

  console.log(`Server running on http://localhost:${PORT}`);

});