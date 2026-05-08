const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "coffee_shop_db"
});

// REGISTER
app.post("/register", async (req, res) => {
  const { username, email, password, confirm_password } = req.body;

  if (password !== confirm_password) {
    return res.json({ message: "Passwords do not match" });
  }

  db.query("SELECT id FROM users WHERE name=?", [username], async (err, result) => {
    if (result.length > 0) {
      return res.json({ message: "Username already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'customer')",
      [username, email, hashed],
      (err) => {
        if (err) return res.json({ message: "Error registering" });

        res.json({ message: "Registration successful" });
      }
    );
  });
});

// LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query("SELECT * FROM users WHERE name=?", [username], async (err, result) => {
    if (result.length === 0) {
      return res.json({ message: "User not found" });
    }

    const user = result[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.json({ message: "Invalid password" });
    }

    res.json({ message: "Login success" });
  });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});