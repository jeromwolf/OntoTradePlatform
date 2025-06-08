import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ResetPasswordConfirmPage from "./pages/ResetPasswordConfirmPage";
import ComponentsTestPage from "./pages/ComponentsTestPage";
import WebSocketTestPage from "./pages/WebSocketTestPage";
import PortfolioPage from "./pages/PortfolioPage";
import TradingPage from "./pages/TradingPage";
import DashboardPage from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import LearningPage from "./pages/LearningPage";
import SimulationPage from "./pages/SimulationPage";
import SessionMonitor from "./components/SessionMonitor";
import MonitoringExample from "./components/MonitoringExample";

// 프로텍티드 라우트 컴포넌트
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// 퍼블릭 라우트 (로그인하지 않은 사용자용)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

// 홈페이지 컴포넌트
const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">OntoTrade Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
              >
                로그인
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                회원가입
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              OntoTrade Platform
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              온톨로지 기반 지능형 거래 플랫폼
            </p>
            <div className="space-x-4">
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg"
              >
                시작하기
              </Link>
              <Link
                to="/login"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-md text-lg"
              >
                로그인
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SessionMonitor />
      <Router>
        <div className="App">
          <Routes>
            <Route
              path="/"
              element={
                <PublicRoute>
                  <HomePage />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPasswordPage />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password-confirm"
              element={
                <PublicRoute>
                  <ResetPasswordConfirmPage />
                </PublicRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portfolio"
              element={
                <ProtectedRoute>
                  <PortfolioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/monitoring"
              element={
                <ProtectedRoute>
                  <MonitoringExample />
                </ProtectedRoute>
              }
            />
            <Route
              path="/components"
              element={
                <ProtectedRoute>
                  <ComponentsTestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trading"
              element={
                <ProtectedRoute>
                  <TradingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/websocket"
              element={
                <ProtectedRoute>
                  <WebSocketTestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <LeaderboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learning"
              element={
                <ProtectedRoute>
                  <LearningPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/simulation"
              element={
                <ProtectedRoute>
                  <SimulationPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
