// ═══════════════════════════════════════════════
// Skill Xchange — Skills Routes
// ═══════════════════════════════════════════════

const express = require("express");
const router = express.Router();

const { getSkills, getCategories } = require("../controllers/skillController");

router.get("/categories", getCategories);
router.get("/", getSkills);

module.exports = router;
