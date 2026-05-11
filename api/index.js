const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();


// =====================================
// MIDDLEWARE
// =====================================

app.use(cors());

// IMPORTANT FIX FOR IMAGE UPLOADS
app.use(express.json({ limit: "50mb" }));

app.use(express.urlencoded({
  limit: "50mb",
  extended: true
}));

const categoryRoutes = require("./routes/categoryRoutes");

app.use("/categories", categoryRoutes);
// =====================================
// ROUTES
// =====================================

// AUTH ROUTES
app.use("/auth", authRoutes);

// PRODUCT ROUTES
app.use("/products", productRoutes);


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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});