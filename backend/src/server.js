// backend/src/server.js
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const ejs = require('ejs');
const path = require("path");
const fs = require("fs");
const { connectDB } = require("./config/db");
const { seed } = require("./scripts/seed");

const authRoutes = require("./routes/auth.routes");
const voterRoutes = require("./routes/voter.routes");
const spectatorRoutes = require("./routes/spectator.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Resolve frontend static directory path
function getFrontendPath() {
  const candidates = [
    path.join(__dirname, '../../frontend'),
    path.join(__dirname, '../../'),
    path.join(process.cwd(), 'frontend'),
    process.cwd()
  ];
  for (const p of candidates) {
    if (fs.existsSync(path.join(p, 'index.html'))) return p;
  }
  return candidates[0];
}

const frontendPath = getFrontendPath();

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', frontendPath);

// Serverless DB Readiness Promise
let isInitialized = false;
let initPromise = null;

async function ensureDB() {
  if (isInitialized) return;
  if (!initPromise) {
    initPromise = (async () => {
      await connectDB();
      const { sequelize } = require("./models");
      await sequelize.sync();
      console.log("Database synced successfully");

      try {
        await seed();
      } catch (seedErr) {
        console.warn("Seeding notice:", seedErr.message);
      }
      isInitialized = true;
    })();
  }
  await initPromise;
}

// Keep static pages available even when the database is unreachable.
app.use("/api", async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (err) {
    console.error("DB Initialization error:", err);
    res.status(500).json({ error: "Database connection failure" });
  }
});

// Serve static assets
app.use(express.static(frontendPath));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/voter", voterRoutes);
app.use("/api/spectator", spectatorRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", database: "connected" });
});

// Serve frontend pages dynamically
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  
  let reqPath = req.path;
  if (reqPath.endsWith('/')) reqPath += 'index.html';
  if (!path.extname(reqPath)) reqPath += '.html';

  const filePath = path.join(frontendPath, reqPath);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

const PORT = process.env.PORT || 4000;

if (!process.env.VERCEL) {
  ensureDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Voting Platform Server running at http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error("Local server startup error:", err);
  });
}

module.exports = app;