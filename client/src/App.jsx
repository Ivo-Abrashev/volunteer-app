// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import EventDetailsPage from './pages/EventDetailsPage';
import CreateEventPage from './pages/CreateEventPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminEventsPage from './pages/AdminEventsPage';
import AdminStatisticsPage from './pages/AdminStatisticsPage';
import VerifyPendingPage from './pages/VerifyPendingPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

// Layout
import Navbar from './components/common/Navbar';

// Pages
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import MyEventsPage from './pages/MyEventsPagе';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import EditEventPage from './pages/EditEventPage';
import EventParticipantsPage from './pages/EventParticipantsPage';
import { Toaster } from 'react-hot-toast';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />  {/* НОВО! */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-pending" element={<VerifyPendingPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          {/* Protected Routes - All authenticated users */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-events"
            element={
              <ProtectedRoute>
                <MyEventsPage />
              </ProtectedRoute>
            }
          />

          {/* Organizer Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/create-event"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                <CreateEventPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/events/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                <EditEventPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/events/:id/participants"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                <EventParticipantsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminEventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/statistics"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminStatisticsPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;