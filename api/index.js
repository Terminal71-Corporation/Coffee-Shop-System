const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/users"); // ADD THIS

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


// =====================================
// ROUTES
// =====================================

app.use("/categories", categoryRoutes);
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/users", userRoutes); // ADD THIS


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