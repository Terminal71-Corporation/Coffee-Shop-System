const db = require("../config/db");

// ======================
// GET ALL USERS
// ======================
exports.getAllUsers = async (req, res) => {
  try {
    const [result] = await db.query(`
      SELECT user_id, name, email, role, age, address, birthdate, profile_picture, created_at
      FROM users
      ORDER BY created_at DESC
    `);
    res.json(result);
  } catch (err) {
    console.log("getAllUsers error:", err);
    res.status(500).json(err);
  }
};

// ======================
// GET USER BY ID
// ======================
exports.getUser = async (req, res) => {
  try {
    const [result] = await db.query(
      `SELECT * FROM users WHERE user_id = ?`,
      [req.params.id]
    );
    res.json(result[0]);
  } catch (err) {
    console.log("getUser error:", err);
    res.status(500).json(err);
  }
};

// ======================
// DELETE USER
// ======================
exports.deleteUser = async (req, res) => {
  try {
    await db.query(
      `DELETE FROM users WHERE user_id = ?`,
      [req.params.id]
    );
    res.json({ message: "User deleted" });
  } catch (err) {
    console.log("deleteUser error:", err);
    res.status(500).json(err);
  }
};

// ======================
// UPDATE BIRTHDATE
// ======================
exports.updateBirthdate = async (req, res) => {
  const { birthdate } = req.body;
  const today = new Date();
  const birth = new Date(birthdate);
  const age = today.getFullYear() - birth.getFullYear();

  try {
    await db.query(
      `UPDATE users SET birthdate = ?, age = ? WHERE user_id = ?`,
      [birthdate, age, req.params.id]
    );
    res.json({ message: "Birthdate updated" });
  } catch (err) {
    res.status(500).json(err);
  }
};

// ======================
// UPDATE ADDRESS
// ======================
exports.updateAddress = async (req, res) => {
  const { address } = req.body;

  try {
    await db.query(
      `UPDATE users SET address = ? WHERE user_id = ?`,
      [address, req.params.id]
    );
    res.json({ message: "Address updated" });
  } catch (err) {
    res.status(500).json(err);
  }
};

// ======================
// UPDATE PROFILE PICTURE
// ======================
exports.updateProfilePicture = async (req, res) => {
  const { profile_picture } = req.body;

  try {
    await db.query(
      `UPDATE users SET profile_picture = ? WHERE user_id = ?`,
      [profile_picture, req.params.id]
    );
    res.json({ message: "Profile picture updated" });
  } catch (err) {
    res.status(500).json(err);
  }
};