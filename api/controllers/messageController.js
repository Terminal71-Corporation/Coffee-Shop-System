const db = require("../config/db");

// SEND MESSAGE
exports.sendMessage = async (req, res) => {
  const { sender_id, receiver_id, message } = req.body;

  if (!sender_id || !receiver_id || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    await db.query(
      `INSERT INTO messages (sender_id, receiver_id, message)
       VALUES (?, ?, ?)`,
      [sender_id, receiver_id, message]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET CONVERSATION (customer <-> admin)
exports.getMessages = async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT *
      FROM messages
      WHERE (sender_id = ? AND receiver_id = ?)
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
      `,
      [user1, user2, user2, user1]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
};

// ADMIN: GET ALL USERS WITH LAST MESSAGE
exports.getAdminChats = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        m1.message_id,
        m1.sender_id,
        m1.receiver_id,
        m1.message,
        m1.created_at,
        u.name AS sender_name
      FROM messages m1
      JOIN users u ON u.user_id = m1.sender_id
      WHERE m1.message_id IN (
        SELECT MAX(message_id)
        FROM messages
        GROUP BY 
          LEAST(sender_id, receiver_id),
          GREATEST(sender_id, receiver_id)
      )
      ORDER BY m1.created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
};

// ADMIN: GET ALL USERS WHO HAVE CHATTED WITH ADMIN
exports.getAdminUsers = async (req, res) => {
  const adminId = 1;

  try {
    const [rows] = await db.query(
      `SELECT DISTINCT
         u.user_id,
         u.name,
         u.email
       FROM users u
       WHERE u.role != 'admin'
         AND (
           u.user_id IN (SELECT sender_id   FROM messages WHERE receiver_id = ?)
           OR
           u.user_id IN (SELECT receiver_id FROM messages WHERE sender_id   = ?)
         )
       ORDER BY u.name ASC`,
      [adminId, adminId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
};

// MARK MESSAGE AS READ
exports.markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(
      `UPDATE messages SET is_read = 1 WHERE message_id = ?`,
      [id]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json(err);
  }
};
