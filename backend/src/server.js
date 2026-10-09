// backend/src/server.js
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const ejs = require('ejs');
const path = require("path");
const { sequelize } = require("./models");
const { assertDatabaseConfig } = require("./config/db");
const { seed } = require("./scripts/seed");

const authRoutes = require("./routes/auth.routes");
const voterRoutes = require("./routes/voter.routes");
const spectatorRoutes = require("./routes/spectator.routes");
const adminRoutes = require("./routes/admin.routes");
const aiRoutes = require("./routes/ai.routes");
const aiCtrl = require("./controllers/ai.controller");

const app = express();

app.use(cors());
app.use(express.json());

let databaseReady;

function initializeDatabase() {
  if (!databaseReady) {
    databaseReady = (async () => {
      assertDatabaseConfig();
      await sequelize.sync();
      console.log("Database synced");
      try {
        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('Votes').catch(() => null);
        if (tableInfo && !tableInfo.walletAddress) {
          await queryInterface.addColumn('Votes', 'walletAddress', {
            type: sequelize.Sequelize.STRING,
            allowNull: true
          });
          console.log("Successfully added walletAddress column to Votes table");
        }
      } catch (alterErr) {
        console.warn("Schema alter notice:", alterErr.message);
      }
      try {
        const { Candidate } = require("./models");
        const fictionalMap = {
          1: { name: 'Aarav Mehta', party: 'People\'s Development Alliance (PDA)', symbol: '⚖️' },
          2: { name: 'Priya Sharma', party: 'National Progress Front (NPF)', symbol: '🪔' },
          3: { name: 'Kabir Verma', party: 'Unity and Reform Party (URP)', symbol: '🌾' },
          4: { name: 'Ananya Rao', party: 'Democratic Future League (DFL)', symbol: '🕊️' },
          5: { name: 'Rohan Kapoor', party: 'People\'s Welfare Movement (PWM)', symbol: '☀️' },
          6: { name: 'Meera Joshi', party: 'Independent Citizens Group (ICG)', symbol: '⛵' },
          7: { name: 'None of the Above (NOTA)', party: 'Independent / ECI', symbol: '❌' }
        };
        for (const [id, f] of Object.entries(fictionalMap)) {
          await Candidate.update(
            { name: f.name, party: f.party, symbol: f.symbol },
            { where: { id: Number(id) } }
          ).catch(() => {});
        }
      } catch (cUpdateErr) {
        console.warn("Candidate DB update notice:", cUpdateErr.message);
      }
      try {
        await seed();
      } catch (seedErr) {
        console.warn("Seeding notice:", seedErr.message);
      }
    })();
  }
  return databaseReady;
}

app.use("/api", async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (err) {
    console.error("Database initialization error:", err.message);
    const error = err.code === "DATABASE_CONFIG_MISSING"
      ? err.message
      : "Database unavailable";
    res.status(503).json({ error });
  }
});

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
app.use("/api/ai", aiRoutes);
app.use("/api/chat", aiRoutes);
app.post("/chat", aiCtrl.handleChat);

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

if (!process.env.VERCEL) {
  initializeDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch(() => {
    process.exitCode = 1;
  });
}

module.exports = app;