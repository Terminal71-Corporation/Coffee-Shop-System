const db = require("../config/db");
const bcrypt = require("bcryptjs");


// =====================================
// REGISTER
// =====================================
exports.register = async (req, res) => {

  const {
    username,
    email,
    password
  } = req.body;

  try {

    // =========================
    // CHECK EMAIL
    // =========================

    const checkSql = `
      SELECT *
      FROM users
      WHERE email = ?
    `;

    db.query(checkSql, [email], async (err, result) => {

      if (err) {
        return res.status(500).json({
          message: "Server error"
        });
      }

      if (result.length > 0) {
        return res.status(400).json({
          message: "Email already exists"
        });
      }

      // =========================
      // HASH PASSWORD
      // =========================

      const hashedPassword =
        await bcrypt.hash(password, 10);

      // =========================
      // INSERT USER
      // =========================

      const insertSql = `
        INSERT INTO users
        (
          name,
          email,
          password,
          role
        )
        VALUES (?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [
          username,
          email,
          hashedPassword,
          "user"
        ],
        (err, result) => {

          if (err) {
            return res.status(500).json({
              message: "Registration failed"
            });
          }

          res.status(201).json({
            message: "Registration successful"
          });

        }
      );

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error"
    });
  }
};



// =====================================
// LOGIN
// =====================================
exports.login = (req, res) => {

  const {
    username,
    password
  } = req.body;

  // username field = email
  const sql = `
    SELECT *
    FROM users
    WHERE email = ?
  `;

  db.query(
    sql,
    [username],
    async (err, result) => {

      if (err) {
        return res.status(500).json({
          message: "Server error"
        });
      }

      if (result.length === 0) {
        return res.status(401).json({
          message: "Invalid credentials"
        });
      }

      const user = result[0];

      // =========================
      // CHECK PASSWORD
      // =========================

      const validPassword =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!validPassword) {
        return res.status(401).json({
          message: "Invalid credentials"
        });
      }

<<<<<<< HEAD
      // =========================
      // LOGIN SUCCESS
      // =========================
=======
<<<<<<< HEAD
    db.query("SELECT * FROM users WHERE name=?", [username], async (err, result) => {
        if (result.length === 0) {
=======
        db.query("SELECT * FROM users WHERE name=?", [username], async (err, result) => {
>>>>>>> 666aa8ff0b9132823035d884f93740d5dba12996

      res.status(200).json({

<<<<<<< HEAD
=======
        if (!result || result.length === 0) {
>>>>>>> 3b0cb0b6129ac018c46d01f0a47b4341bfc85e2f
            return res.json({ message: "User not found" });
        }

        const user = result[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.json({ message: "Invalid password" });
        }

        // ✅ Return user info so the frontend can save it
        res.json({ 
>>>>>>> 666aa8ff0b9132823035d884f93740d5dba12996
        message: "Login success",

        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          age: user.age,
          address: user.address,
          profile_picture: user.profile_picture
        }

      });

    }
  );
};