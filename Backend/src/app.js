// ═══════════════════════════════════════════════
// Skill Xchange — Express App Configuration
// ═══════════════════════════════════════════════

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const skillRoutes = require("./routes/skillRoutes");
const requestRoutes = require("./routes/requestRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const creditRoutes = require("./routes/creditRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// ── Middleware ──────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check / root ──────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "Skill Xchange API is running 🚀",
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// ── API Routes ───────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/credits", creditRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);

module.exports = app;
