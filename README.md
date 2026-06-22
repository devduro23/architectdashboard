# ArchPortal — Architect Performance & Payout Dashboard

A secure, architect-facing web dashboard where individual architects can log in and view only their own data — sites, dealers, and payout eligibility.

## Tech Stack
- **Frontend:** React 18 + Vite + Tailwind CSS + Recharts
- **Backend:** Node.js + Express.js + sql.js (SQLite)
- **Auth:** JWT (HTTP-only cookie) + bcryptjs

## Quick Start

### 1. Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Place Excel file
```
Copy your Excel file to: backend/data/architects_data.xlsx
```

The file should have two sheets:
- **Site Details sheet** — columns: Architect Name, Lead Code, Project Name, Linked Dealer, City, State, Lead Stage, Expected Maturity Date, etc.
- **Pay-Out sheet** — columns: Architect Name, Mobile Number, Mapped ISR, Site Name, Product Code, Eligible Qty, Tier, Calculated Payout, Remit (YES/NO)

### 3. Seed the database
```bash
cd backend
node seed.js
```

### 4. Start the servers

**Option A — Double-click `start.bat`** (opens two terminal windows)

**Option B — Manual:**
```bash
# Terminal 1 (backend)
cd backend
node server.js

# Terminal 2 (frontend)
cd frontend
npm run dev
```

### 5. Open the app
Visit: **http://localhost:5173**

**Default credentials:** Mobile number = Username = Password

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login with mobile + password |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/auth/me` | Get logged-in architect |
| POST | `/api/auth/change-password` | Update password |
| GET | `/api/sites` | All sites for logged-in architect |
| GET | `/api/sites/:id` | Single site + its payouts |
| GET | `/api/payouts` | All payouts for logged-in architect |
| GET | `/api/payouts/summary` | Stats summary + per-site chart data |

## Security
- Architects can only access their own data (enforced server-side via JWT)
- Passwords stored as bcrypt hashes (salt rounds: 12)
- Rate limiting: max 5 login attempts per 15 min per IP
- HTTP-only cookies (7-day expiry)

## File Structure
```
ArchDashboard/
├── backend/
│   ├── server.js          # Express server
│   ├── db.js              # sql.js SQLite setup + persistence
│   ├── seed.js            # Excel parser + DB seeder
│   ├── middleware/auth.js # JWT verification
│   ├── routes/
│   │   ├── auth.js
│   │   ├── sites.js
│   │   └── payouts.js
│   ├── data/
│   │   ├── architects_data.xlsx   ← place your Excel here
│   │   └── archportal.db          ← auto-created after seed
│   └── .env
└── frontend/
    └── src/
        ├── pages/
        │   ├── Login.jsx
        │   ├── Dashboard.jsx
        │   └── Profile.jsx
        └── components/
            ├── StatCard.jsx
            ├── SiteTable.jsx
            ├── PayoutTable.jsx
            ├── PayoutChart.jsx
            ├── SiteDrawer.jsx
            ├── Navbar.jsx
            └── Sidebar.jsx
```
