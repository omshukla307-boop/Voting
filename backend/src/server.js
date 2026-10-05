// backend/src/server.js
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const ejs = require('ejs');
const path = require("path");
const { sequelize } = require("./models");

const authRoutes = require("./routes/auth.routes");
const voterRoutes = require("./routes/voter.routes");
const spectatorRoutes = require("./routes/spectator.routes");
const adminRoutes = require("./routes/admin.routes");

// 1. CREATE THE EXPRESS APP FIRST
const app = express();

app.use(cors());
app.use(express.json());

// 2. CONFIGURE EJS (Now it knows what 'app' is!)
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '../../frontend'));

// 3. API ROUTES (Always good to define APIs before HTML routes)
app.use("/api/auth", authRoutes);
app.use("/api/voter", voterRoutes);
app.use("/api/spectator", spectatorRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// 4. HTML EJS RENDER ROUTES
// Render the home page automatically
app.get('/', (req, res) => {
  res.render('index.html');
});

// Catch-all route that renders any HTML page dynamically
app.get('/:page.html', (req, res) => {
  res.render(req.params.page + '.html');
});

// 5. SERVE STATIC ASSETS (CSS, JS)
// We specifically serve only these folders so Express doesn't auto-serve the raw .html files
app.use('/css', express.static(path.join(__dirname, '../../frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../../frontend/js')));
app.use('/img', express.static(path.join(__dirname, '../../frontend/img')));
// Note: If you have an images or assets folder, you would add it here like this:
// app.use('/assets', express.static(path.join(__dirname, '../../frontend/assets')));

// 6. START THE SERVER
const PORT = process.env.PORT || 4000;

sequelize.sync().then(() => {
  console.log("Database synced");
  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}).catch(err => {
  console.error("Database sync error:", err);
});

module.exports = app;