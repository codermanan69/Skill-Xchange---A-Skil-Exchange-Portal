// ═══════════════════════════════════════════════
// Skill Xchange — Users Routes
// ═══════════════════════════════════════════════

const express = require("express");
const router = express.Router();

const {
  getMyProfile,
  updateMyProfile,
  getUserById,
  discoverUsers,
} = require("../controllers/userController");

const { protect, optionalAuth } = require("../middleware/authMiddleware");

// Current user profile endpoints
router.get("/me", protect, getMyProfile);
router.patch("/me", protect, updateMyProfile);

// Discover users and skill matches
router.get("/discover", optionalAuth, discoverUsers);

// Specific user profile by ID
router.get("/:id", getUserById);

module.exports = router;
