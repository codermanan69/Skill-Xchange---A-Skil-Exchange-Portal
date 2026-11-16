// ═══════════════════════════════════════════════
// Skill Xchange — Authentication Middleware
// ═══════════════════════════════════════════════

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect middleware: requires a valid JWT token
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No authentication token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User belonging to this token no longer exists.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Session expired. Please log in again."
        : "Invalid authentication token.";

    return res.status(401).json({
      success: false,
      message,
    });
  }
};

/**
 * Optional auth middleware: extracts user if token provided, but does not block if absent
 */
const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch {
      // Token is invalid/expired; continue without attaching user
      req.user = null;
    }
  }
  next();
};

module.exports = { protect, optionalAuth };
