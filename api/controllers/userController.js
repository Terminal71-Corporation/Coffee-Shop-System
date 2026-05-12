const db = require("../config/db");

// ======================
// GET ALL USERS
// ======================
exports.getAllUsers = (req, res) => {
  const sql = `
    SELECT user_id, name, email, role, age, address, created_at
    FROM users
    ORDER BY created_at DESC
  `;
  db.query(sql, (err, result) => {
    if (err) {
      console.log("getAllUsers error:", err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
};

// ======================
// GET USER BY ID
// ======================
exports.getUser = (req, res) => {
  const sql = `SELECT * FROM users WHERE user_id = ?`;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.log("getUser error:", err);
      return res.status(500).json(err);
    }
    res.json(result[0]);
  });
};

// ======================
// DELETE USER
// ======================
exports.deleteUser = (req, res) => {
  const sql = `DELETE FROM users WHERE user_id = ?`;
  db.query(sql, [req.params.id], (err) => {
    if (err) {
      console.log("deleteUser error:", err);
      return res.status(500).json(err);
    }
    res.json({ message: "User deleted" });
  });
};

// ======================
// UPDATE BIRTHDATE
// ======================
exports.updateBirthdate = (req, res) => {
  const { birthdate } = req.body;
  const today = new Date();
  const birth = new Date(birthdate);
  const age = today.getFullYear() - birth.getFullYear();
  const sql = `UPDATE users SET birthdate = ?, age = ? WHERE user_id = ?`;
  db.query(sql, [birthdate, age, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Birthdate updated" });
  });
};

// ======================
// UPDATE ADDRESS
// ======================
exports.updateAddress = (req, res) => {
  const { address } = req.body;
  const sql = `UPDATE users SET address = ? WHERE user_id = ?`;
  db.query(sql, [address, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Address updated" });
  });
};

// ======================
// UPDATE PROFILE PICTURE
// ======================
exports.updateProfilePicture = (req, res) => {
  const { profile_picture } = req.body;
  const sql = `UPDATE users SET profile_picture = ? WHERE user_id = ?`;
  db.query(sql, [profile_picture, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Profile picture updated" });
  });
};