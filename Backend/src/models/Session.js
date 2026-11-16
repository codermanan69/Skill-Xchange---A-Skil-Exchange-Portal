// ═══════════════════════════════════════════════
// Skill Xchange — Learning Session Model
// ═══════════════════════════════════════════════

const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      default: null,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher is required"],
      index: true,
    },
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Learner is required"],
      index: true,
    },
    skill: {
      type: String,
      required: [true, "Skill is required"],
      trim: true,
    },
    topic: {
      type: String,
      default: "",
      trim: true,
      maxlength: [200, "Topic cannot exceed 200 characters"],
    },
    date: {
      type: String,
      required: [true, "Date is required (YYYY-MM-DD)"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be formatted as YYYY-MM-DD"],
    },
    time: {
      type: String,
      required: [true, "Time is required (HH:mm)"],
      match: [/^\d{2}:\d{2}$/, "Time must be formatted as HH:mm"],
    },
    duration: {
      type: Number,
      default: 60,
      min: [15, "Session must be at least 15 minutes"],
      max: [300, "Session cannot exceed 300 minutes"],
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
      index: true,
    },
    meetingLink: {
      type: String,
      default: function () {
        const rand = (len) => Math.random().toString(36).substring(2, 2 + len);
        return `https://meet.google.com/${rand(3)}-${rand(4)}-${rand(3)}`;
      },
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      default: null,
    },
    review: {
      type: String,
      default: null,
      trim: true,
      maxlength: [1000, "Review cannot exceed 1000 characters"],
    },
    completedAt: {
      type: Date,
      default: null,
    },
    creditsTransferred: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.teacherId = doc.teacher ? (doc.teacher._id ? doc.teacher._id.toString() : doc.teacher.toString()) : null;
        ret.learnerId = doc.learner ? (doc.learner._id ? doc.learner._id.toString() : doc.learner.toString()) : null;
        ret.requestId = doc.request ? (doc.request._id ? doc.request._id.toString() : doc.request.toString()) : null;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Virtual getters for frontend compatibility
sessionSchema.virtual("teacherId").get(function () {
  return this.teacher?._id ? this.teacher._id.toString() : this.teacher?.toString();
});

sessionSchema.virtual("learnerId").get(function () {
  return this.learner?._id ? this.learner._id.toString() : this.learner?.toString();
});

sessionSchema.virtual("requestId").get(function () {
  return this.request?._id ? this.request._id.toString() : this.request?.toString();
});

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
