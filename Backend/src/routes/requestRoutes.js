// ═══════════════════════════════════════════════
// Skill Xchange — Requests Routes
// ═══════════════════════════════════════════════

const express = require("express");
const router = express.Router();

const {
  sendRequest,
  getRequests,
  acceptRequest,
  rejectRequest,
} = require("../controllers/requestController");

const { protect } = require("../middleware/authMiddleware");

// All request operations require authentication
router.use(protect);

router.route("/")
  .post(sendRequest)
  .get(getRequests);

router.patch("/:id/accept", acceptRequest);
router.patch("/:id/reject", rejectRequest);

module.exports = router;
