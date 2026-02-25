import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import FundExplorer from './pages/FundExplorer';
import FundDetail from './pages/FundDetail';
import RiskProfiler from './pages/RiskProfiler';
import Portfolio from './pages/Portfolio';
import AdvisorHub from './pages/AdvisorHub';
import AdvisorProfileDetail from './pages/AdvisorProfileDetail';
import AdminPanel from './pages/AdminPanel';
import ClickSpark from './components/ClickSpark';

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" />;
  return children;
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="loading-spinner" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>;

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/funds" element={<ProtectedRoute><FundExplorer /></ProtectedRoute>} />
        <Route path="/funds/:id" element={<ProtectedRoute><FundDetail /></ProtectedRoute>} />
        <Route path="/risk-profiler" element={<ProtectedRoute roles={['INVESTOR']}><RiskProfiler /></ProtectedRoute>} />
        <Route path="/portfolio" element={<ProtectedRoute roles={['INVESTOR']}><Portfolio /></ProtectedRoute>} />
        <Route path="/advisors" element={<ProtectedRoute roles={['INVESTOR']}><AdvisorHub /></ProtectedRoute>} />
        <Route path="/advisors/:id" element={<ProtectedRoute roles={['INVESTOR']}><AdvisorProfileDetail /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminPanel /></ProtectedRoute>} />

        {/* Default */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />} />
      </Routes>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ClickSpark sparkColor="#818cf8" sparkSize={12} sparkRadius={20} sparkCount={10} duration={500} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
