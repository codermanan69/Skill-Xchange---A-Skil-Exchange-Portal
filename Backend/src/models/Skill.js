// ═══════════════════════════════════════════════
// Skill Xchange — Skill Catalog Model
// ═══════════════════════════════════════════════

const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Skill name is required"],
      unique: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category name is required"],
      enum: ["Development", "Design", "Marketing", "Data & AI", "Business", "Other"],
      default: "Other",
      trim: true,
    },
    categoryId: {
      type: String,
      enum: ["cat_dev", "cat_design", "cat_marketing", "cat_data", "cat_business", "cat_other"],
      default: "cat_dev",
      trim: true,
    },
    color: {
      type: String,
      default: "#6366f1",
      trim: true,
    },
    bgColor: {
      type: String,
      default: "#eef2ff",
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

const Skill = mongoose.model("Skill", skillSchema);

module.exports = Skill;
