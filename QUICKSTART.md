# 🗳️ blockchain-evoting — Quick Start Guide

A complete, beginner-friendly online voting application with a Node.js/Express backend and a simple HTML/JavaScript frontend.

---

## ✨ Features

- **Voter Authentication** — Login with voterId and password (JWT-based)
- **Vote Casting** — Select from candidates and cast votes
- **Live Results** — Real-time vote counting (spectator view)
- **Final Tally** — View final results with vote percentages
- **Demo Data** — Pre-seeded election, candidates, and test voter

---

## 🚀 Quick Start (Backend)

### Prerequisites
- **Node.js** (v18+)
- **MySQL** OR SQLite (default, auto-created)

### 1. Install Dependencies

```bash
cd backend
npm install
cd ..
```

### 2. Start the Server

**Default (SQLite, local testing):**
```bash
npm start
```

**Using MySQL:**
```powershell
$env:DB_DIALECT='mysql'
$env:DB_HOST='localhost'
$env:DB_PORT='3306'
$env:DB_NAME='Vote_Test'
$env:DB_USER='root'
$env:DB_PASS='YOUR_PASSWORD'
npm start
```

The server will:
- Connect to the database
- Create/sync tables automatically
- Seed demo data (election, candidates, test voter)
- Listen on **http://localhost:4000**

---

## 🎯 Using the Frontend

### Demo Credentials
- **Voter ID:** `voter1`
- **Password:** `password123`

### Access Points

| Page | URL |
|------|-----|
| Home | `http://localhost:4000/` |
| Login | `http://localhost:4000/pages/auth/Login.html` |
| Vote | `http://localhost:4000/pages/voter/VotePage.html` |
| Live Results | `http://localhost:4000/pages/spectator/LiveCounting.html` |
| Final Results | `http://localhost:4000/pages/spectator/FinalResult.html` |

### User Flow

1. **Home Page** (`index.html`) — Click "Get Started"
2. **Login** — Enter `voter1` / `password123`
3. **Main Menu** — Choose "Cast Your Vote" or "View Live Results"
4. **Vote** — Select a candidate button and submit
5. **Confirmation** — See your receipt hash and return to menu
6. **Results** — View live counts (auto-refreshes every 3 seconds) or final tally

---

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/login` — Login and get JWT token
  - Body: `{ voterId, password }`
  - Response: `{ token }`

### Voting
- `POST /api/voter/vote` — Cast a vote (requires token)
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ candidateId, electionId }`
  - Response: `{ id, hash }`

### Results (Public)
- `GET /api/spectator/candidates` — List all candidates
  - Response: `{ candidates: [...] }`
- `GET /api/spectator/live` — Get live vote counts
  - Response: `{ results: [...] }`
- `GET /api/spectator/final` — Get final results
  - Response: `{ results: [...] }`

### Health Check
- `GET /api/health` — Server status
  - Response: `{ status: 'ok' }`

---

## 📁 Project Structure

```
voterCode/
  backend/
    src/
      config/db.js           # Database connection (MySQL/SQLite)
      models/               # Sequelize models (User, Election, Candidate, Vote)
      controllers/          # API handlers (auth, voter, spectator, admin)
      routes/              # Route definitions
      middleware/          # Auth middleware (JWT)
      scripts/seed.js      # Demo data seeding
      server.js            # Express app entry
    package.json
    README.md

  frontend/
    index.html            # Home page
    styles.css            # Unified styles
    pages/
      auth/Login.html     # Login form
      main/MainMenu.html  # Authenticated user menu
      voter/
        VotePage.html     # Voting interface
        AfterVote.html    # Vote confirmation
      spectator/
        LiveCounting.html # Live results (refreshes every 3s)
        FinalResult.html  # Final results with percentages
```

---

## 🔑 Key Concepts

### Database Models
- **User** — voterId (PK), aadharNo, name, email, role, password
- **Election** — id (PK), name, level, state, startTime, endTime, status
- **Candidate** — id (PK), name, party, symbol, electionId, constituency, state, voteCount
- **Vote** — id (PK), voterId, candidateId, electionId, voteHash (unique receipt)

### JWT Token
- Issued on login
- Expires in 1 hour
- Stored in browser `localStorage`
- Required for voting (`Authorization: Bearer <token>`)

### Double-Vote Prevention
- Database unique index on `(voterId, electionId)` in Vote table
- Backend validates before creating vote record

---

## 🧪 Testing the API

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"voterId":"voter1","password":"password123"}'
```
Response: `{"message":"Login successful","token":"eyJhbG..."}`

### Get Candidates
```bash
curl http://localhost:4000/api/spectator/candidates
```

### Cast a Vote
```bash
curl -X POST http://localhost:4000/api/voter/vote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"candidateId":1,"electionId":1}'
```

---

## 📝 Notes

- **First-time setup only:** The backend automatically runs `sequelize.sync()` on startup. Use `FORCE_SYNC=1` env var to drop and recreate all tables (destructive, local dev only).
- **Seeding:** Demo data (election, candidates, test voter) is auto-created on startup if missing.
- **SQLite storage:** By default uses `data/database.sqlite` in the backend folder.
- **CORS:** Enabled for requests from `localhost` (via Helmet & CORS middleware).

---

## 🚦 Troubleshooting

**Port 4000 already in use?**
- Kill the process: `taskkill /PID <pid> /F` (Windows) or `kill <pid>` (Unix)
- Or run on a different port by modifying `src/server.js` line changing `PORT = 4000`

**Server connection error in the browser?**
- Check `https://<your-deployment-domain>/api/health`; a healthy deployment returns JSON.
- Ensure the backend changes are pushed and the latest deployment completed.
- In Vercel Project Settings → Environment Variables, configure `DATABASE_URL` with Supabase's IPv4-compatible Transaction Pooler URI (from Supabase Dashboard → Connect → Transaction Pooler; typically port 6543) and set `JWT_SECRET`, then redeploy. The direct `db.<project-ref>.supabase.co` address may be IPv6-only and unreachable from Vercel.
- Do not use SQLite for Vercel deployments.
- Locally, confirm the backend is running: `npm --prefix backend start`.
- For a preview or alternate host, set `window.__VOTING_API_BASE__` to the backend's full API URL before loading `/js/main.js`.

**Cannot login?**
- Confirm test voter was created: Check server output for "Created test voter"
- Try credentials: `voter1` / `password123`

**Candidates not showing?**
- Ensure seeding completed (check server output)
- Verify `/api/spectator/candidates` returns data

**Vote failed?**
- Ensure you're logged in (token in localStorage)
- Check election `id` in VotePage.html (currently hardcoded to `1`)

---

## 📚 Further Development

- Add admin pages to create elections and manage candidates
- Implement blockchain integration for immutable vote records
- Add email verification for voter registration
- Build a real spectator dashboard with charts
- Add 2FA/OTP for enhanced security
- Deploy to production (consider environment variables, HTTPS, and database backups)

---

**Enjoy secure, transparent voting! 🗳️✨**
