// ═══════════════════════════════════════════════
// Skill Xchange — App Root
// ═══════════════════════════════════════════════

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Layout from './components/Layout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import Profile from './pages/Profile';
import Requests from './pages/Requests';
import Chat from './pages/Chat';
import Sessions from './pages/Sessions';
import Credits from './pages/Credits';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-surface-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public Route wrapper (redirect to dashboard if already logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected routes with layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
