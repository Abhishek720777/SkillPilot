# 🚀 SkillPilot

**SkillPilot** is a high-performance, full-stack educational platform engineered to gamify software engineering assessments. Featuring a distributed real-time battle engine, adaptive algorithmic quizzes, and a highly secure, Docker-isolated remote code execution (RCE) environment, it empowers developers to master Data Structures, Systems Architecture, and Web Development through competitive, low-latency 1v1 coding arenas.

![SkillPilot Layout](frontend/public/logo.png)

## ✨ Features

- **⚔️ Real-Time Multiplayer Battles**: Challenge friends or global users in live quiz and coding battle rooms powered by Socket.io. Includes robust host controls, live rankings, and anti-cheat mechanisms that disqualify users who navigate away or disconnect.
- **🛡️ Secure Code Execution**: Write and run Java, Python, and JavaScript directly in the browser. Untrusted code is securely executed inside isolated, ephemeral Docker containers with strict memory and network limits to prevent malicious activity.
- **🧠 Expansive Curriculum**: Practice across 20+ specialized subtopics with nearly 300 unique questions, covering:
  - **DSA**: Dynamic Programming, Arrays, Trees, Graphs.
  - **Languages**: Advanced Java (Spring Boot, OOP) & Python (Django).
  - **Web Development**: HTML/CSS, Vanilla JS, React.
  - **Databases**: SQL Joins, Normalization, NoSQL.
  - **Aptitude**: Quantitative & Logical Reasoning.
- **🏆 Global Leaderboard & Progression**: Climb the ranks on a dynamic, animated leaderboard with an EXP-based progression and ELO system. Track your "Topic Mastery" across all subjects.
- **💬 Live Messaging**: Built-in real-time chat and friend request system to connect with other developers.
- **🔒 Secure Authentication**: Cookie-based authentication with strict HTTP-only JWTs, plus seamless Google OAuth integration.

## 🛠️ Technology Stack

- **Frontend**: React (Vite), React Router, Vanilla CSS (Custom modern UI system).
- **Backend**: Node.js, Express.js, Socket.io.
- **Database**: MongoDB.
- **Code Engine**: Docker CLI (DinD - Docker-in-Docker sandboxing).
- **Authentication**: JWT, Google OAuth2, bcrypt.

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (Local instance or Atlas URI)
- Docker Desktop (Must be running for the code execution engine to work)

### 1. Clone & Install
```bash
git clone https://github.com/Abhishek720777/SkillPilot.git
cd SkillPilot

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillpilot
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:5173
```

Create a `.env.local` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Run the App
Start both servers concurrently or in separate terminals:
```bash
# Terminal 1 (Backend)
cd backend
npm run dev

# Terminal 2 (Frontend)
cd frontend
npm run dev
```

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
