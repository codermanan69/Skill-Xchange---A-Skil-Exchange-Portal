// ═══════════════════════════════════════════════
// Skill Xchange — Users Controller
// ═══════════════════════════════════════════════

const mongoose = require("mongoose");
const User = require("../models/User");
const { defaultSkills } = require("./skillController");

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
const getMyProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user.toJSON(),
    });
  } catch (err) {
    console.error("getMyProfile error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching profile",
    });
  }
};

/**
 * @desc    Update current user profile
 * @route   PATCH /api/users/me
 * @access  Private
 */
const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      name,
      title,
      bio,
      location,
      avatar,
      skillsTeaching,
      skillsLearning,
      notificationPreferences,
    } = req.body;

    // Apply allowed profile updates
    if (typeof name === "string" && name.trim()) user.name = name.trim();
    if (typeof title === "string") user.title = title.trim();
    if (typeof bio === "string") user.bio = bio.trim();
    if (typeof location === "string") user.location = location.trim();
    if (typeof avatar === "string" && avatar.trim()) user.avatar = avatar.trim();

    if (Array.isArray(skillsTeaching)) {
      user.skillsTeaching = skillsTeaching.map((s) => String(s).trim()).filter(Boolean);
    }

    if (Array.isArray(skillsLearning)) {
      user.skillsLearning = skillsLearning.map((s) => String(s).trim()).filter(Boolean);
    }

    if (notificationPreferences && typeof notificationPreferences === "object") {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences,
      };
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser.toJSON(),
    });
  } catch (err) {
    console.error("updateMyProfile error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error updating profile",
    });
  }
};

/**
 * @desc    Get user profile by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error("getUserById error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching user",
    });
  }
};

/**
 * @desc    Discover users and find skill matches
 * @route   GET /api/users/discover
 * @access  Public (Enhanced if authenticated)
 */
const discoverUsers = async (req, res) => {
  try {
    const { search, category } = req.query;
    const currentUserId = req.user ? req.user._id : null;
    const currentUser = req.user || null;

    let filter = {};

    // Exclude current authenticated user from discovery list
    if (currentUserId) {
      filter._id = { $ne: currentUserId };
    }

    // Search query filter (matches name, title, location, teaching or learning skills)
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { name: regex },
        { title: regex },
        { location: regex },
        { skillsTeaching: regex },
        { skillsLearning: regex },
      ];
    }

    // Category filter
    if (category && category !== "all") {
      const catSkills = defaultSkills
        .filter(
          (s) =>
            s.categoryId === category ||
            s.category.toLowerCase() === category.toLowerCase()
        )
        .map((s) => s.name);

      if (catSkills.length > 0) {
        filter.skillsTeaching = { $in: catSkills };
      }
    }

    const rawUsers = await User.find(filter).select("-password").sort({ rating: -1, createdAt: -1 });

    // Transform users and compute skill matches if requester is authenticated
    const usersWithMatches = rawUsers.map((u) => {
      const userObj = u.toJSON();

      if (currentUser) {
        const matchingSkills = (u.skillsTeaching || []).filter((s) =>
          (currentUser.skillsLearning || []).includes(s)
        );
        const reverseMatch = (currentUser.skillsTeaching || []).filter((s) =>
          (u.skillsLearning || []).includes(s)
        );
        const matchScore = matchingSkills.length + reverseMatch.length;

        userObj.matchingSkills = matchingSkills;
        userObj.reverseMatch = reverseMatch;
        userObj.matchScore = matchScore;
      } else {
        userObj.matchingSkills = [];
        userObj.reverseMatch = [];
        userObj.matchScore = 0;
      }

      return userObj;
    });

    // Extract top matches (matchScore > 0 sorted descending)
    const matches = usersWithMatches
      .filter((u) => u.matchScore > 0)
      .map((u) => ({
        user: u,
        matchingSkills: u.matchingSkills,
        reverseMatch: u.reverseMatch,
        matchScore: u.matchScore,
      }))
      .sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json({
      success: true,
      count: usersWithMatches.length,
      users: usersWithMatches,
      matches,
    });
  } catch (err) {
    console.error("discoverUsers error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error discovering users",
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getUserById,
  discoverUsers,
};
