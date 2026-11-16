// ═══════════════════════════════════════════════
// Skill Xchange — Chat Routes
// ═══════════════════════════════════════════════

const express = require("express");
const router = express.Router();

const {
  getConversations,
  getMessages,
  sendMessage,
} = require("../controllers/chatController");

const { protect } = require("../middleware/authMiddleware");

// All chat endpoints require authentication
router.use(protect);

router.get("/conversations", getConversations);
router.route("/:userId")
  .get(getMessages)
  .post(sendMessage);

module.exports = router;
