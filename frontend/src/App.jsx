import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";

// Lazy load pages
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const PracticePage = lazy(() => import("./pages/PracticePage"));
const QuizPage = lazy(() => import("./pages/QuizPage"));
const QuizResultPage = lazy(() => import("./pages/QuizResultPage"));
const BattlePage = lazy(() => import("./pages/BattlePage"));
const BattleRoomPage = lazy(() => import("./pages/BattleRoomPage"));
const BattleResultPage = lazy(() => import("./pages/BattleResultPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const Home = lazy(() => import("./pages/Home"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Loading fallback component
const PageLoader = () => (
  <div style={{ 
    height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', 
    justifyContent: 'center', background: '#030712' 
  }}>
    <div className="spinner spinner-primary" style={{ width: 40, height: 40 }} />
  </div>
);

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <RegisterPage />
                </GuestRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <GuestRoute>
                  <ForgotPasswordPage />
                </GuestRoute>
              }
            />
            <Route path="/" element={<Home />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/practice" element={<PracticePage />} />
              <Route path="/quiz/:sessionId" element={<QuizPage />} />
              <Route
                path="/quiz/:sessionId/result"
                element={<QuizResultPage />}
              />
              <Route path="/battle" element={<BattlePage />} />
              <Route path="/battle/:battleId" element={<BattleRoomPage />} />
              <Route
                path="/battle/:battleId/result"
                element={<BattleResultPage />}
              />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/:userId" element={<ChatPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
