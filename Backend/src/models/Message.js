// ═══════════════════════════════════════════════
// Skill Xchange — Chat Message Model
// ═══════════════════════════════════════════════

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationKey: {
      type: String,
      required: [true, "conversationKey is required"],
      index: true,
      trim: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient is required"],
      index: true,
    },
    text: {
      type: String,
      required: [true, "Message text is required"],
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.senderId = doc.sender ? (doc.sender._id ? doc.sender._id.toString() : doc.sender.toString()) : null;
        ret.recipientId = doc.recipient ? (doc.recipient._id ? doc.recipient._id.toString() : doc.recipient.toString()) : null;
        ret.timestamp = doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Helper static method to generate conversation key matching frontend logic
messageSchema.statics.getConversationKey = function (userId1, userId2) {
  return [userId1.toString(), userId2.toString()].sort().join("_");
};

// Virtual getters for frontend compatibility
messageSchema.virtual("senderId").get(function () {
  return this.sender?._id ? this.sender._id.toString() : this.sender?.toString();
});

messageSchema.virtual("recipientId").get(function () {
  return this.recipient?._id ? this.recipient._id.toString() : this.recipient?.toString();
});

messageSchema.virtual("timestamp").get(function () {
  return this.createdAt ? this.createdAt.toISOString() : null;
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
