// ═══════════════════════════════════════════════
// Skill Xchange — MongoDB Connection
// ═══════════════════════════════════════════════

const fs = require("fs");
const path = require("path");
const dns = require("dns");
const mongoose = require("mongoose");

// Ensure public DNS resolver is used for MongoDB SRV records on Windows networks
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Fall back to system default if setting servers is restricted
}

// Fallback env loader in case db.js is invoked independently
if (!process.env.MONGODB_URI) {
  const candidatePaths = [
    path.resolve(__dirname, "../../../.env"),
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "../.env"),
  ];
  const envFile = candidatePaths.find((p) => fs.existsSync(p));
  if (envFile) {
    require("dotenv").config({ path: envFile });
  }
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌  MONGODB_URI is not defined in environment variables.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`❌  MongoDB connection failed: ${err.message}`);
    if (err.message.includes("whitelist") || err.message.includes("SSL alert number 80") || err.message.includes("ECONNREFUSED")) {
      console.error("💡  Atlas Troubleshooting: Ensure your current IP is added to MongoDB Atlas Network Access (or use 0.0.0.0/0 for development).");
    }
    process.exit(1);
  }
};

// Log subsequent connection events
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️   MongoDB disconnected.");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄  MongoDB reconnected.");
});

module.exports = connectDB;
