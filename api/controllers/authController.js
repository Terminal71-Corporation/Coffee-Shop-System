const db = require("../config/db");
const bcrypt = require("bcryptjs");

// ===================== REGISTER =====================
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  const checkSql = "SELECT * FROM users WHERE email = ?";

  db.query(checkSql, [email], async (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertSql =
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

    db.query(
      insertSql,
      [username, email, hashedPassword, "user"],
      (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Registration failed" });
        }

        return res.json({ message: "Registration successful" });
      }
    );
  });
};

// ===================== LOGIN =====================
exports.login = (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({
      message: "Login success",
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });
};