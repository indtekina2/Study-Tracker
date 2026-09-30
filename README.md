# 📚 Study Tracker & Progress Dashboard

A full-stack MERN application to help students track study progress, log chapters and practice questions, monitor subject coverage, and analyze mock test scores.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 (Vite 6), Tailwind CSS v4, Lucide Icons, Recharts |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Auth | JWT (Access + Refresh tokens with httpOnly cookies) |
| Data Fetching | TanStack React Query v5 + Axios |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

**Server** (`server/.env`):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/study-tracker
JWT_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Client** (`client/.env`):
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Run

```bash
# Terminal 1 — Start backend
cd server
npm run dev

# Terminal 2 — Start frontend
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Features

- 🔐 **Secure Auth** — JWT with httpOnly refresh cookies
- 📖 **Subject & Chapter Management** — CRUD with status tracking & subtopics
- 📝 **Daily Study Logs** — Track time, questions, accuracy per session
- 📊 **Mock Test Analytics** — Score trends, weak area detection
- 📈 **Interactive Dashboard** — Charts for study time, subject distribution, score progression
- 🌙 **Dark/Light Mode** — Toggle with persistent preference
- 📱 **Fully Responsive** — Mobile-first design

## API Endpoints

| Route | Methods | Description |
|---|---|---|
| `/api/auth` | POST register/login/refresh/logout, GET me | Authentication |
| `/api/subjects` | GET, POST, PUT, DELETE | Subject CRUD |
| `/api/chapters` | GET, POST, PUT, DELETE | Chapter CRUD |
| `/api/logs` | GET, POST, GET /stats | Study session logs |
| `/api/mock-tests` | GET, POST, DELETE, GET /analytics | Mock test management |
