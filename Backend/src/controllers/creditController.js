// ═══════════════════════════════════════════════
// Skill Xchange — Credits Controller
// ═══════════════════════════════════════════════

const User = require("../models/User");
const Transaction = require("../models/Transaction");

/**
 * @desc    Get user's wallet summary (balance, total earned, total spent)
 * @route   GET /api/credits
 * @access  Private
 */
const getWalletSummary = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const transactions = await Transaction.find({ user: user._id }).sort({
      createdAt: -1,
    });

    const totalEarned = transactions
      .filter((t) => t.type === "earned" || t.type === "bonus")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSpent = transactions
      .filter((t) => t.type === "spent")
      .reduce((sum, t) => sum + t.amount, 0);

    const welcomeBonus = transactions
      .filter((t) => t.type === "bonus")
      .reduce((sum, t) => sum + t.amount, 0);

    const recentTransactions = transactions.slice(0, 5).map((t) => t.toJSON());

    return res.status(200).json({
      success: true,
      balance: user.credits,
      totalEarned,
      totalSpent,
      welcomeBonus,
      recentTransactions,
    });
  } catch (err) {
    console.error("getWalletSummary error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching wallet summary",
    });
  }
};

/**
 * @desc    Get chronological credit transaction history
 * @route   GET /api/credits/transactions
 * @access  Private
 */
const getTransactionHistory = async (req, res) => {
  try {
    const userFields = "name email avatar title";
    const sessionFields = "skill topic date time duration";

    const transactions = await Transaction.find({ user: req.user._id })
      .populate("fromUser", userFields)
      .populate("session", sessionFields)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      transactions: transactions.map((t) => t.toJSON()),
    });
  } catch (err) {
    console.error("getTransactionHistory error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching transaction history",
    });
  }
};

module.exports = {
  getWalletSummary,
  getTransactionHistory,
};
