// ═══════════════════════════════════════════════
// Skill Xchange — Chat Controller
// ═══════════════════════════════════════════════

const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");
const Request = require("../models/Request");

/**
 * @desc    Get all active conversation threads for current user
 * @route   GET /api/chat/conversations
 * @access  Private
 */
const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // 1. Find all accepted connections for current user
    const acceptedRequests = await Request.find({
      $or: [{ fromUser: currentUserId }, { toUser: currentUserId }],
      status: "accepted",
    });

    const partnerIdSet = new Set();
    acceptedRequests.forEach((r) => {
      const otherId =
        r.fromUser.toString() === currentUserId.toString()
          ? r.toUser.toString()
          : r.fromUser.toString();
      partnerIdSet.add(otherId);
    });

    // 2. Also find any users with whom messages have been exchanged
    const recentMessages = await Message.find({
      $or: [{ sender: currentUserId }, { recipient: currentUserId }],
    }).select("sender recipient");

    recentMessages.forEach((m) => {
      const otherId =
        m.sender.toString() === currentUserId.toString()
          ? m.recipient.toString()
          : m.sender.toString();
      partnerIdSet.add(otherId);
    });

    const partnerIds = Array.from(partnerIdSet);

    // 3. For each partner, load profile, last message, and unread count
    const conversations = await Promise.all(
      partnerIds.map(async (partnerId) => {
        const partner = await User.findById(partnerId).select(
          "name email avatar title rating isOnline location"
        );
        if (!partner) return null;

        const conversationKey = Message.getConversationKey(currentUserId, partnerId);

        const lastMessage = await Message.findOne({ conversationKey })
          .sort({ createdAt: -1 });

        const unreadCount = await Message.countDocuments({
          conversationKey,
          recipient: currentUserId,
          read: false,
        });

        return {
          partner: partner.toJSON(),
          lastMessage: lastMessage ? lastMessage.toJSON() : null,
          unreadCount,
          lastActivity: lastMessage ? lastMessage.createdAt : new Date(0),
        };
      })
    );

    // Filter out nulls and sort by last message timestamp descending
    const validConversations = conversations
      .filter(Boolean)
      .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
      .map(({ partner, lastMessage, unreadCount }) => ({
        partner,
        lastMessage,
        unreadCount,
      }));

    return res.status(200).json({
      success: true,
      count: validConversations.length,
      conversations: validConversations,
    });
  } catch (err) {
    console.error("getConversations error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching conversations",
    });
  }
};

/**
 * @desc    Get message history with a specific user (paginated)
 * @route   GET /api/chat/:userId
 * @access  Private
 */
const getMessages = async (req, res) => {
  try {
    const { userId: partnerId } = req.params;
    const currentUserId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid partner user ID format",
      });
    }

    if (currentUserId.toString() === partnerId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot open a chat conversation with yourself",
      });
    }

    const partner = await User.findById(partnerId).select(
      "name email avatar title rating isOnline location"
    );

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Chat partner not found",
      });
    }

    const conversationKey = Message.getConversationKey(currentUserId, partnerId);

    // Pagination parameters
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const total = await Message.countDocuments({ conversationKey });

    const messages = await Message.find({ conversationKey })
      .sort({ createdAt: 1 }) // Chronological order (oldest to newest)
      .skip(skip)
      .limit(limit);

    // Mark unread messages sent by partner to current user as read
    await Message.updateMany(
      {
        conversationKey,
        sender: partnerId,
        recipient: currentUserId,
        read: false,
      },
      { read: true }
    );

    return res.status(200).json({
      success: true,
      count: messages.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      partner: partner.toJSON(),
      messages: messages.map((m) => m.toJSON()),
    });
  } catch (err) {
    console.error("getMessages error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching messages",
    });
  }
};

/**
 * @desc    Send a message to a specific user
 * @route   POST /api/chat/:userId
 * @access  Private
 */
const sendMessage = async (req, res) => {
  try {
    const { userId: recipientId } = req.params;
    const { text } = req.body;
    const senderId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipient ID format",
      });
    }

    if (senderId.toString() === recipientId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot send messages to yourself",
      });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content cannot be empty",
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Recipient user not found",
      });
    }

    const conversationKey = Message.getConversationKey(senderId, recipientId);

    const message = await Message.create({
      conversationKey,
      sender: senderId,
      recipient: recipientId,
      text: text.trim(),
      read: false,
    });

    return res.status(201).json({
      success: true,
      message: message.toJSON(),
    });
  } catch (err) {
    console.error("sendMessage error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error sending message",
    });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
};
