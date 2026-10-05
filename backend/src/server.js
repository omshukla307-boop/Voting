// backend/src/server.js
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const ejs = require('ejs');
const path = require("path");
const { sequelize } = require("./models");
const { seed } = require("./scripts/seed");

const authRoutes = require("./routes/auth.routes");
const voterRoutes = require("./routes/voter.routes");
const spectatorRoutes = require("./routes/spectator.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

app.use(cors());
app.use(express.json());

const frontendPath = path.join(__dirname, '../../frontend');

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', frontendPath);

// Serve all static assets from frontend
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
  res.sendFile(filePath, (err) => {
    if (err) {
      // Fallback to index.html
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });
});

const PORT = process.env.PORT || 4000;

sequelize.sync().then(async () => {
  console.log("Database synced");
  try {
    await seed();
  } catch (seedErr) {
    console.warn("Seeding notice:", seedErr.message);
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}).catch(err => {
  console.error("Database sync error:", err);
});

module.exports = app;