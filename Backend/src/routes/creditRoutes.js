// ═══════════════════════════════════════════════
// Skill Xchange — Credits Routes
// ═══════════════════════════════════════════════

const express = require("express");
const router = express.Router();

const {
  getWalletSummary,
  getTransactionHistory,
} = require("../controllers/creditController");

const { protect } = require("../middleware/authMiddleware");

// All credit endpoints require authentication
router.use(protect);

router.get("/", getWalletSummary);
router.get("/transactions", getTransactionHistory);

module.exports = router;
