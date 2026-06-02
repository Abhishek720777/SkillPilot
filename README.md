#  SkillPilot live-> https://skill-pilot-liart.vercel.app/

**SkillPilot** is a high-performance, full-stack educational platform engineered to gamify software engineering assessments. Featuring a distributed real-time battle engine, adaptive algorithmic quizzes, and a highly secure, Docker-isolated remote code execution (RCE) environment, it empowers developers to master Data Structures, Systems Architecture, and Web Development through competitive, low-latency 1v1 coding arenas.

## ✨ Features

- **⚔️ Real-Time Multiplayer Battles**: Challenge friends or global users in live quiz and coding battle rooms powered by Socket.io. Includes robust host controls, live rankings, and anti-cheat mechanisms.
- **🛡️ Secure Code Execution**: Write and run Java, Python, and JavaScript directly in the browser. Untrusted code is securely executed inside isolated, ephemeral Docker containers with strict memory and network limits.
- **🧠 Adaptive Progression Engine**: Algorithmic quiz logic that filters previously seen questions and identifies "Weak Areas" (accuracy <60%) to personalize your learning path.
- **🛡️ Advanced Anti-Cheat**: 
  - **Tab Switch Detection**: Immediate disqualification if the user leaves the browser tab or minimizes the window during a challenge.
  - **Copy Protection**: Zero text-selection and disabled right-click context menus on all assessment pages.
- **🏆 Global Leaderboard & Progression**: Climb the ranks on a dynamic leaderboard with an EXP-based progression and ELO system.
- **⚡ Performance Optimized**: 
  - **Initial Load**: Optimized via React Code Splitting (Lazy Loading) and vendor chunking.
  - **Database**: High-speed indexing on MongoDB for near-instant stat calculations and ranking updates.
  - **Caching**: Server-side caching for high-frequency curriculum and topic data.
- **🔒 Secure Authentication**: Cookie-based authentication with strict HTTP-only JWTs and Google OAuth integration.

## 🛠️ Technology Stack

- **Frontend**: React (Vite), React Router, Lucide Icons, Vanilla CSS.
- **Backend**: Node.js, Express.js, Socket.io, Redis-ready caching.
- **Database**: MongoDB (with optimized indexing).
- **Code Engine**: Docker-in-Docker (DinD) sandboxing.
- **Testing**: Jest, Supertest (83.7% coverage on core execution engine).

## 🧪 Testing & Quality Assurance

SkillPilot is built with a "Quality First" mindset. The core execution engine and authentication system are protected by a comprehensive suite of integration tests.

```bash
# Run backend tests with coverage
cd backend
npm test -- --coverage
```

**Key Metrics:**
- **RCE Engine Coverage**: 83.7%
- **ELO/EXP Logic**: 100%
- **Database Model Validation**: 100%

##  Local Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Docker Desktop (Required for Code Engine)

### 1. Install Dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Environment Setup
Create `.env` in `backend/`:
```env
PORT=3001
MONGODB_URI=your_uri
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:5173
```

### 3. Execution
```bash
# Terminal 1 (Backend)
cd backend && npm run dev

# Terminal 2 (Frontend)
cd frontend && npm run dev
```

## 📝 License
MIT License
