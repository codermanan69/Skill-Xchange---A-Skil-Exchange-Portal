// ═══════════════════════════════════════════════
// Skill Xchange — Credit Transaction Ledger Model
// ═══════════════════════════════════════════════

const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner (user) is required"],
      index: true,
    },
    type: {
      type: String,
      enum: ["earned", "spent", "bonus"],
      required: [true, "Transaction type is required"],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be at least 1 credit"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [300, "Description cannot exceed 300 characters"],
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      default: null,
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
        ret.sessionId = doc.session ? (doc.session._id ? doc.session._id.toString() : doc.session.toString()) : null;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Virtual getters for frontend compatibility
transactionSchema.virtual("userId").get(function () {
  return this.user?._id ? this.user._id.toString() : this.user?.toString();
});

transactionSchema.virtual("fromUserId").get(function () {
  return this.fromUser?._id ? this.fromUser._id.toString() : this.fromUser?.toString();
});

transactionSchema.virtual("sessionId").get(function () {
  return this.session?._id ? this.session._id.toString() : this.session?.toString();
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
