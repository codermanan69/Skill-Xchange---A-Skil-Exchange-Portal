// ═══════════════════════════════════════════════
// Skill Xchange — Skills Controller
// ═══════════════════════════════════════════════

const Skill = require("../models/Skill");

const defaultCategories = [
  { id: "cat_dev", name: "Development", color: "#6366f1", bgColor: "#eef2ff" },
  { id: "cat_design", name: "Design", color: "#d946ef", bgColor: "#fdf4ff" },
  { id: "cat_marketing", name: "Marketing", color: "#f59e0b", bgColor: "#fffbeb" },
  { id: "cat_data", name: "Data & AI", color: "#10b981", bgColor: "#ecfdf5" },
  { id: "cat_business", name: "Business", color: "#3b82f6", bgColor: "#eff6ff" },
];

const defaultSkills = [
  // Development
  { name: "React", category: "Development", categoryId: "cat_dev", color: "#6366f1", bgColor: "#eef2ff" },
  { name: "JavaScript", category: "Development", categoryId: "cat_dev", color: "#6366f1", bgColor: "#eef2ff" },
  { name: "HTML/CSS", category: "Development", categoryId: "cat_dev", color: "#6366f1", bgColor: "#eef2ff" },
  { name: "Next.js", category: "Development", categoryId: "cat_dev", color: "#6366f1", bgColor: "#eef2ff" },
  { name: "Node.js", category: "Development", categoryId: "cat_dev", color: "#6366f1", bgColor: "#eef2ff" },
  { name: "Python", category: "Development", categoryId: "cat_dev", color: "#6366f1", bgColor: "#eef2ff" },
  { name: "Django", category: "Development", categoryId: "cat_dev", color: "#6366f1", bgColor: "#eef2ff" },
  { name: "Tailwind CSS", category: "Development", categoryId: "cat_dev", color: "#6366f1", bgColor: "#eef2ff" },
  { name: "Cloud Computing", category: "Development", categoryId: "cat_dev", color: "#6366f1", bgColor: "#eef2ff" },

  // Design
  { name: "UI/UX Design", category: "Design", categoryId: "cat_design", color: "#d946ef", bgColor: "#fdf4ff" },
  { name: "Figma", category: "Design", categoryId: "cat_design", color: "#d946ef", bgColor: "#fdf4ff" },
  { name: "Adobe XD", category: "Design", categoryId: "cat_design", color: "#d946ef", bgColor: "#fdf4ff" },
  { name: "Wireframing", category: "Design", categoryId: "cat_design", color: "#d946ef", bgColor: "#fdf4ff" },
  { name: "Graphic Design", category: "Design", categoryId: "cat_design", color: "#d946ef", bgColor: "#fdf4ff" },
  { name: "Photoshop", category: "Design", categoryId: "cat_design", color: "#d946ef", bgColor: "#fdf4ff" },
  { name: "Illustrator", category: "Design", categoryId: "cat_design", color: "#d946ef", bgColor: "#fdf4ff" },
  { name: "Branding", category: "Design", categoryId: "cat_design", color: "#d946ef", bgColor: "#fdf4ff" },

  // Marketing
  { name: "Digital Marketing", category: "Marketing", categoryId: "cat_marketing", color: "#f59e0b", bgColor: "#fffbeb" },
  { name: "SEO", category: "Marketing", categoryId: "cat_marketing", color: "#f59e0b", bgColor: "#fffbeb" },
  { name: "Google Ads", category: "Marketing", categoryId: "cat_marketing", color: "#f59e0b", bgColor: "#fffbeb" },
  { name: "Content Writing", category: "Marketing", categoryId: "cat_marketing", color: "#f59e0b", bgColor: "#fffbeb" },

  // Data & AI
  { name: "Data Science", category: "Data & AI", categoryId: "cat_data", color: "#10b981", bgColor: "#ecfdf5" },
  { name: "Machine Learning", category: "Data & AI", categoryId: "cat_data", color: "#10b981", bgColor: "#ecfdf5" },
  { name: "Data Analytics", category: "Data & AI", categoryId: "cat_data", color: "#10b981", bgColor: "#ecfdf5" },
];

/**
 * @desc    Get all skills (auto-seeds catalog if database is empty)
 * @route   GET /api/skills
 * @access  Public
 */
const getSkills = async (req, res) => {
  try {
    const { category, categoryId } = req.query;
    let query = {};

    if (category) query.category = category;
    if (categoryId) query.categoryId = categoryId;

    let skillsList = await Skill.find(query).sort({ name: 1 });

    // Seed default skills on first run if empty
    if (skillsList.length === 0 && Object.keys(query).length === 0) {
      const count = await Skill.countDocuments();
      if (count === 0) {
        await Skill.insertMany(defaultSkills);
        skillsList = await Skill.find().sort({ name: 1 });
      }
    }

    return res.status(200).json({
      success: true,
      count: skillsList.length,
      skills: skillsList,
    });
  } catch (err) {
    console.error("getSkills error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching skills",
    });
  }
};

/**
 * @desc    Get skill categories
 * @route   GET /api/skills/categories
 * @access  Public
 */
const getCategories = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      categories: defaultCategories,
    });
  } catch (err) {
    console.error("getCategories error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching categories",
    });
  }
};

module.exports = {
  getSkills,
  getCategories,
  defaultCategories,
  defaultSkills,
};
