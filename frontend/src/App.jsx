import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WebsiteLoader from './components/WebsiteLoader';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
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
import { scheduleRoleSessionPrefetch } from './services/appDataCache';

const THEME_STORAGE_KEY = 'investwise-theme';

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function ProtectedRoute({ children, roles, showColdStartNoticeOnAuthRedirect = false }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          showColdStartNotice: showColdStartNoticeOnAuthRedirect || Boolean(location.state?.showColdStartNotice),
        }}
      />
    );
  }
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" />;
  return children;
}

function AppRoutes({ theme, onToggleTheme }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const previousPathnameRef = useRef(location.pathname);
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  const useDoodleBackground = !['/', '/login', '/register', '/forgot-password'].includes(location.pathname);
  const cameFromLandingPage = previousPathnameRef.current === '/';
  const shouldShowAuthColdStartNotice = cameFromLandingPage || Boolean(location.state?.showColdStartNotice);

  useEffect(() => {
    document.body.classList.toggle('app-body--doodles', useDoodleBackground);

    return () => {
      document.body.classList.remove('app-body--doodles');
    };
  }, [useDoodleBackground]);

  useEffect(() => {
    previousPathnameRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (!isAuthenticated || !user?.role) return;
    scheduleRoleSessionPrefetch(user.role);
  }, [isAuthenticated, user?.role]);

  if (loading) return <div className="loading-spinner" style={{ minHeight: '100vh/*  */' }}><div className="spinner"></div></div>;

  return (
    <div className={`app-shell ${useDoodleBackground ? 'app-shell--doodles' : ''}`}>
      {!isAuthPage && <Navbar theme={theme} onToggleTheme={onToggleTheme} />}
      <Routes>
        {/* Public */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage showColdStartNotice={shouldShowAuthColdStartNotice} />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage showColdStartNotice={shouldShowAuthColdStartNotice} />} />
        <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPasswordPage />} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/funds" element={<ProtectedRoute showColdStartNoticeOnAuthRedirect={cameFromLandingPage}><FundExplorer /></ProtectedRoute>} />
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
  const [theme, setTheme] = useState(getInitialTheme);
  const [showLoader, setShowLoader] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !window.sessionStorage.getItem('investwise-loader-seen');
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const handleLoaderFinished = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('investwise-loader-seen', 'true');
    }
    setShowLoader(false);
  };

  const handleToggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <ClickSpark sparkColor="#818cf8" sparkSize={12} sparkRadius={20} sparkCount={10} duration={500} />
        {showLoader && <WebsiteLoader onFinished={handleLoaderFinished} />}
        <AppRoutes theme={theme} onToggleTheme={handleToggleTheme} />
      </AuthProvider>
    </BrowserRouter>
  );
}
