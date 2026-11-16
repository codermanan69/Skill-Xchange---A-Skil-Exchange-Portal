// ═══════════════════════════════════════════════
// Skill Xchange — Notification Model
// ═══════════════════════════════════════════════

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient (user) is required"],
      index: true,
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      enum: [
        "request_received",
        "request_accepted",
        "session_scheduled",
        "session_reminder",
        "credit_received",
        "review_received",
        "system",
      ],
      required: [true, "Notification type is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    link: {
      type: String,
      default: "/",
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.userId = doc.user ? (doc.user._id ? doc.user._id.toString() : doc.user.toString()) : null;
        ret.fromUserId = doc.fromUser ? (doc.fromUser._id ? doc.fromUser._id.toString() : doc.fromUser.toString()) : null;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Virtual getters for frontend compatibility
notificationSchema.virtual("userId").get(function () {
  return this.user?._id ? this.user._id.toString() : this.user?.toString();
});

notificationSchema.virtual("fromUserId").get(function () {
  return this.fromUser?._id ? this.fromUser._id.toString() : this.fromUser?.toString();
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
