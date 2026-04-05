import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WebsiteLoader from './components/WebsiteLoader';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import FundExplorer from './pages/FundExplorer';
import FundDetail from './pages/FundDetail';
import RiskProfiler from './pages/RiskProfiler';
import Portfolio from './pages/Portfolio';
import AdvisorHub from './pages/AdvisorHub';
import AdvisorAppointments from './pages/AdvisorAppointments';
import AdvisorProfileDetail from './pages/AdvisorProfileDetail';
import AdminPanel from './pages/AdminPanel';
import AnalystDataManagement from './pages/AnalystDataManagement';
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
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const useDoodleBackground = !['/', '/login', '/register'].includes(location.pathname);

  useEffect(() => {
    document.body.classList.toggle('app-body--doodles', useDoodleBackground);

    return () => {
      document.body.classList.remove('app-body--doodles');
    };
  }, [useDoodleBackground]);

  if (loading) return <div className="loading-spinner" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>;

  return (
    <div className={`app-shell ${useDoodleBackground ? 'app-shell--doodles' : ''}`}>
      {!isAuthPage && <Navbar />}
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
        <Route path="/appointments" element={<ProtectedRoute roles={['ADVISOR']}><AdvisorAppointments /></ProtectedRoute>} />
        <Route path="/data-management" element={<ProtectedRoute roles={['ANALYST', 'ADMIN']}><AnalystDataManagement /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminPanel /></ProtectedRoute>} />

        {/* Default */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />} />
      </Routes>
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default function App() {
  const [showLoader, setShowLoader] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !window.sessionStorage.getItem('investwise-loader-seen');
  });

  const handleLoaderFinished = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('investwise-loader-seen', 'true');
    }
    setShowLoader(false);
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <ClickSpark sparkColor="#818cf8" sparkSize={12} sparkRadius={20} sparkCount={10} duration={500} />
        {showLoader && <WebsiteLoader onFinished={handleLoaderFinished} />}
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
