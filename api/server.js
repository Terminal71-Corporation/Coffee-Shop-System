const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

// =====================================
// MIDDLEWARE (must come before routes)
// =====================================

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json({ limit: "50mb" }));

app.use(express.urlencoded({
  limit: "50mb",
  extended: true
}));

// =====================================
// ROUTES
// =====================================

app.use("/api/messages", messageRoutes);
app.use("/categories", categoryRoutes);
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/users", userRoutes);

// =====================================
// TEST ROUTE
// =====================================

app.get("/", (req, res) => {
  res.send("Coffee Shop API Running ☕");
});

// =====================================
// SERVER
// =====================================

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// routes
app.use('/products', require('./routes/productRoutes'))
app.use('/', require('./routes/authRoutes'));

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
