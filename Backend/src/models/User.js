// ═══════════════════════════════════════════════
// Skill Xchange — User Model
// ═══════════════════════════════════════════════

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    avatar: {
      type: String,
      default: function () {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          this.name || "User"
        )}&backgroundColor=b6e3f4`;
      },
    },
    title: {
      type: String,
      default: "",
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: [1000, "Bio cannot exceed 1000 characters"],
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    skillsTeaching: {
      type: [String],
      default: [],
    },
    skillsLearning: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSessions: {
      type: Number,
      default: 0,
      min: 0,
    },
    credits: {
      type: Number,
      default: 100, // Welcome bonus matching frontend
      min: 0,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    notificationPreferences: {
      emailRequests: { type: Boolean, default: true },
      emailSessions: { type: Boolean, default: true },
      emailCredits: { type: Boolean, default: true },
      pushRequests: { type: Boolean, default: true },
      pushSessions: { type: Boolean, default: true },
      pushCredits: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.joinedDate = doc.createdAt ? doc.createdAt.toISOString().split("T")[0] : null;
        delete ret._id;
        delete ret.__v;
        delete ret.password; // Never expose password hash in serialized output
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted joined date matching frontend
userSchema.virtual("joinedDate").get(function () {
  return this.createdAt ? this.createdAt.toISOString().split("T")[0] : null;
});

// Pre-save hook to hash password with bcrypt
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to check password validity
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
