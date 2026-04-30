# 🚀 SkillPilot

SkillPilot is a real-time, multiplayer educational platform built for learners who want to measure and beat their limits. It combines adaptive quizzes, live 1v1 coding battles, and a secure code execution engine to provide a premium, gamified learning experience.

![SkillPilot Layout](frontend/public/logo.png)

## ✨ Features

- **⚔️ Real-Time 1v1 Battles**: Challenge friends or global users in live quiz and coding battle rooms powered by Socket.io.
- **🛡️ Secure Code Execution**: Write and run Java, Python, and JavaScript directly in the browser. Untrusted code is securely executed inside isolated, ephemeral Docker containers with strict memory and network limits to prevent malicious activity.
- **🧠 Adaptive Quizzes**: Practice non-repeating questions based on your history and track accuracy across specific sub-topics.
- **🏆 Global Leaderboard**: Climb the ranks on a dynamic, animated leaderboard with an EXP-based progression and ELO system.
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
