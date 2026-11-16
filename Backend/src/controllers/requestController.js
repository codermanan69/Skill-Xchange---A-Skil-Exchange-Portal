// ═══════════════════════════════════════════════
// Skill Xchange — Requests Controller
// ═══════════════════════════════════════════════

const mongoose = require("mongoose");
const Request = require("../models/Request");
const User = require("../models/User");
const Notification = require("../models/Notification");

/**
 * @desc    Send a new skill exchange request
 * @route   POST /api/requests
 * @access  Private
 */
const sendRequest = async (req, res) => {
  try {
    const { toUserId, skillOffered, skillWanted, message } = req.body;
    const fromUserId = req.user._id;

    // 1. Validation
    if (!toUserId) {
      return res.status(400).json({
        success: false,
        message: "Recipient ID (toUserId) is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipient ID format",
      });
    }

    if (fromUserId.toString() === toUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot send an exchange request to yourself",
      });
    }

    if (!skillOffered || !skillOffered.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please specify the skill you can offer",
      });
    }

    if (!skillWanted || !skillWanted.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please specify the skill you want to learn",
      });
    }

    // 2. Check if recipient exists
    const recipient = await User.findById(toUserId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Recipient user not found",
      });
    }

    // 3. Prevent duplicate pending requests
    const existingRequest = await Request.findOne({
      fromUser: fromUserId,
      toUser: toUserId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "A pending request to this user already exists",
      });
    }

    // 4. Create request
    const newRequest = await Request.create({
      fromUser: fromUserId,
      toUser: toUserId,
      skillOffered: skillOffered.trim(),
      skillWanted: skillWanted.trim(),
      message: message ? message.trim() : "",
      status: "pending",
    });

    // 5. Create in-app notification for recipient
    try {
      await Notification.create({
        user: toUserId,
        fromUser: fromUserId,
        type: "request_received",
        title: "New Learning Request",
        message: `${req.user.name} wants to learn ${skillWanted.trim()} from you`,
        link: "/requests",
      });
    } catch (notifErr) {
      console.warn("Could not create notification for request:", notifErr.message);
    }

    // Return populated request
    const populatedRequest = await Request.findById(newRequest._id)
      .populate("fromUser", "name email avatar title rating isOnline location")
      .populate("toUser", "name email avatar title rating isOnline location");

    return res.status(201).json({
      success: true,
      message: `Request sent to ${recipient.name}!`,
      request: populatedRequest.toJSON(),
    });
  } catch (err) {
    console.error("sendRequest error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error sending request",
    });
  }
};

/**
 * @desc    Get user requests (incoming, outgoing, or both)
 * @route   GET /api/requests
 * @access  Private
 */
const getRequests = async (req, res) => {
  try {
    const { type } = req.query; // 'incoming' | 'outgoing' | undefined
    const userId = req.user._id;

    const userField = "name email avatar title rating isOnline location skillsTeaching skillsLearning";

    let filter = {
      $or: [{ fromUser: userId }, { toUser: userId }],
    };

    if (type === "incoming") {
      filter = { toUser: userId };
    } else if (type === "outgoing") {
      filter = { fromUser: userId };
    }

    const allRequests = await Request.find(filter)
      .populate("fromUser", userField)
      .populate("toUser", userField)
      .sort({ createdAt: -1 });

    const incoming = allRequests.filter(
      (r) => r.toUser && r.toUser._id.toString() === userId.toString()
    );

    const outgoing = allRequests.filter(
      (r) => r.fromUser && r.fromUser._id.toString() === userId.toString()
    );

    return res.status(200).json({
      success: true,
      count: allRequests.length,
      requests: allRequests.map((r) => r.toJSON()),
      incoming: incoming.map((r) => r.toJSON()),
      outgoing: outgoing.map((r) => r.toJSON()),
    });
  } catch (err) {
    console.error("getRequests error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching requests",
    });
  }
};

/**
 * @desc    Accept an incoming exchange request
 * @route   PATCH /api/requests/:id/accept
 * @access  Private (Recipient only)
 */
const acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID format",
      });
    }

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Only the recipient can accept
    if (request.toUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to accept this request",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Request has already been ${request.status}`,
      });
    }

    request.status = "accepted";
    await request.save();

    // Create notification for sender
    try {
      await Notification.create({
        user: request.fromUser,
        fromUser: req.user._id,
        type: "request_accepted",
        title: "Request Accepted!",
        message: `${req.user.name} accepted your request to learn ${request.skillWanted}. You can now chat!`,
        link: "/chat",
      });
    } catch (notifErr) {
      console.warn("Could not create notification for accepted request:", notifErr.message);
    }

    const updatedRequest = await Request.findById(request._id)
      .populate("fromUser", "name email avatar title rating isOnline location")
      .populate("toUser", "name email avatar title rating isOnline location");

    return res.status(200).json({
      success: true,
      message: "Request accepted! You can now chat and schedule sessions.",
      request: updatedRequest.toJSON(),
    });
  } catch (err) {
    console.error("acceptRequest error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error accepting request",
    });
  }
};

/**
 * @desc    Reject an incoming exchange request
 * @route   PATCH /api/requests/:id/reject
 * @access  Private (Recipient only)
 */
const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID format",
      });
    }

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Only the recipient can reject
    if (request.toUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to reject this request",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Request has already been ${request.status}`,
      });
    }

    request.status = "rejected";
    await request.save();

    const updatedRequest = await Request.findById(request._id)
      .populate("fromUser", "name email avatar title rating isOnline location")
      .populate("toUser", "name email avatar title rating isOnline location");

    return res.status(200).json({
      success: true,
      message: "Request rejected",
      request: updatedRequest.toJSON(),
    });
  } catch (err) {
    console.error("rejectRequest error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error rejecting request",
    });
  }
};

module.exports = {
  sendRequest,
  getRequests,
  acceptRequest,
  rejectRequest,
};
