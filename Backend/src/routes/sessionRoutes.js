// ═══════════════════════════════════════════════
// Skill Xchange — Sessions Routes
// ═══════════════════════════════════════════════

const express = require("express");
const router = express.Router();

const {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  completeSession,
  cancelSession,
  reviewSession,
} = require("../controllers/sessionController");

const { protect } = require("../middleware/authMiddleware");

// All session operations require authentication
router.use(protect);

router.route("/")
  .post(createSession)
  .get(getSessions);

router.route("/:id")
  .get(getSessionById)
  .patch(updateSession);

router.patch("/:id/complete", completeSession);
router.patch("/:id/cancel", cancelSession);
router.post("/:id/review", reviewSession);

module.exports = router;
