const express = require("express");
const router = express.Router();

const {
  sendMessage,
  getMessages,
  getAdminChats,
  getAdminUsers,
  markAsRead
} = require("../controllers/messageController");

// ======================
// USER MESSAGES
// ======================
router.post("/send", sendMessage);
router.get("/conversation/:user1/:user2", getMessages);

// ======================
// ADMIN MESSAGES
// ======================
router.get("/admin/chats", getAdminChats);
router.get("/admin/users", getAdminUsers);
router.put("/read/:id", markAsRead);

module.exports = router;