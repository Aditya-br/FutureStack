import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useUser } from '@clerk/clerk-react';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Hooks
import { useAuthToken } from './hooks/useAuthToken';

// Analytics
import { trackPageView, identifyUser, resetAnalytics } from './lib/analytics';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import InternshipList from './pages/InternshipList';
import HackathonList from './pages/HackathonList';
import AddOpportunity from './pages/AddOpportunity';
import EditOpportunity from './pages/EditOpportunity';
import StatusBoard from './pages/StatusBoard';
import Calendar from './pages/Calendar';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { user, isSignedIn } = useUser();

  // Initialize auth token getter for API calls
  useAuthToken();

  // Track page views on route changes
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  // Identify user when signed in
  useEffect(() => {
    if (isSignedIn && user) {
      identifyUser(user.id, user.primaryEmailAddress?.emailAddress);
    } else if (!isSignedIn) {
      resetAnalytics();
    }
  }, [isSignedIn, user]);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {!isHomePage && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/internships" element={
          <ProtectedRoute>
            <InternshipList />
          </ProtectedRoute>
        } />
        <Route path="/hackathons" element={
          <ProtectedRoute>
            <HackathonList />
          </ProtectedRoute>
        } />
        <Route path="/add" element={
          <ProtectedRoute>
            <AddOpportunity />
          </ProtectedRoute>
        } />
        <Route path="/edit/:id" element={
          <ProtectedRoute>
            <EditOpportunity />
          </ProtectedRoute>
        } />
        <Route path="/status-board" element={
          <ProtectedRoute>
            <StatusBoard />
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}

export default App;


