// ═══════════════════════════════════════════════
// Skill Xchange — Auth Controller
// ═══════════════════════════════════════════════

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const generateToken = require("../utils/generateToken");

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      title,
      bio,
      location,
      skillsTeaching,
      skillsLearning,
    } = req.body;

    // 1. Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide your name",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email address",
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // 2. Prevent duplicate email registration
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    // 3. Create user (100 welcome credits default in schema)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      title: title?.trim() || "",
      bio: bio?.trim() || "",
      location: location?.trim() || "",
      skillsTeaching: Array.isArray(skillsTeaching) ? skillsTeaching : [],
      skillsLearning: Array.isArray(skillsLearning) ? skillsLearning : [],
      credits: 100,
      isOnline: true,
    });

    // 4. Record welcome bonus transaction in ledger
    try {
      await Transaction.create({
        user: user._id,
        type: "bonus",
        amount: 100,
        description: "Welcome bonus on joining Skill Xchange",
        fromUser: null,
        session: null,
      });
    } catch (txnErr) {
      console.warn("Could not record welcome transaction:", txnErr.message);
    }

    // 5. Generate token & respond
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Registration successful. Welcome to Skill Xchange!",
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error during registration",
    });
  }
};

/**
 * @desc    Login existing user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password",
      });
    }

    // 2. Check for user (explicitly selecting password since select: false)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4. Update online status
    user.isOnline = true;
    await user.save({ validateBeforeSave: false });

    // 5. Generate token & respond
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error during login",
    });
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user.toJSON(),
    });
  } catch (err) {
    console.error("GetMe error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching user profile",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
