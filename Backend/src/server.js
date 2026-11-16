// ═══════════════════════════════════════════════
// Skill Xchange — Server Entry Point
// ═══════════════════════════════════════════════

const fs = require("fs");
const path = require("path");

// Robust .env resolution: supports running from root, Backend, or any subdirectory
const candidatePaths = [
  path.resolve(__dirname, "../../.env"),   // root .env when __dirname is Backend/src
  path.resolve(process.cwd(), ".env"),     // root .env when cwd is root
  path.resolve(process.cwd(), "../.env"),  // root .env when cwd is Backend
  path.resolve(__dirname, "../.env"),     // Backend/.env if it exists
];

const resolvedPath = candidatePaths.find((p) => fs.existsSync(p));
if (resolvedPath) {
  require("dotenv").config({ path: resolvedPath });
} else {
  require("dotenv").config();
}

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB Atlas before accepting any requests
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀  Skill Xchange server running on port ${PORT}`);
    console.log(`📡  Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

startServer();
