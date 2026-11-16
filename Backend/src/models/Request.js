// ═══════════════════════════════════════════════
// Skill Xchange — Exchange Request Model
// ═══════════════════════════════════════════════

const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender (fromUser) is required"],
      index: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient (toUser) is required"],
      index: true,
    },
    skillOffered: {
      type: String,
      required: [true, "Skill offered is required"],
      trim: true,
    },
    skillWanted: {
      type: String,
      required: [true, "Skill wanted is required"],
      trim: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.fromUserId = doc.fromUser ? (doc.fromUser._id ? doc.fromUser._id.toString() : doc.fromUser.toString()) : null;
        ret.toUserId = doc.toUser ? (doc.toUser._id ? doc.toUser._id.toString() : doc.toUser.toString()) : null;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Virtual getters for frontend compatibility
requestSchema.virtual("fromUserId").get(function () {
  return this.fromUser?._id ? this.fromUser._id.toString() : this.fromUser?.toString();
});

requestSchema.virtual("toUserId").get(function () {
  return this.toUser?._id ? this.toUser._id.toString() : this.toUser?.toString();
});

const Request = mongoose.model("Request", requestSchema);

module.exports = Request;
