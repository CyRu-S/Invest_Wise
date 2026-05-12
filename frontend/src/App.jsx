import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WebsiteLoader from './components/WebsiteLoader';
import ClickSpark from './components/ClickSpark';
import { scheduleRoleSessionPrefetch } from './services/appDataCache';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FundExplorer = lazy(() => import('./pages/FundExplorer'));
const FundDetail = lazy(() => import('./pages/FundDetail'));
const RiskProfiler = lazy(() => import('./pages/RiskProfiler'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const AdvisorHub = lazy(() => import('./pages/AdvisorHub'));
const AdvisorAppointments = lazy(() => import('./pages/AdvisorAppointments'));
const AdvisorProfileDetail = lazy(() => import('./pages/AdvisorProfileDetail'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const AnalystDataManagement = lazy(() => import('./pages/AnalystDataManagement'));

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

function RouteFallback() {
  return (
    <div className="loading-spinner" style={{ minHeight: '100vh' }}>
      <div className="spinner"></div>
    </div>
  );
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
      <Suspense fallback={<RouteFallback />}>
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
      </Suspense>
      {!isAuthPage && <Footer />}
    </div>
  );
}

function ThemeController({ theme }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isPublicLandingPage = location.pathname === '/' && !isAuthenticated;
  const isPublicAuthPage =
    !isAuthenticated && ['/login', '/register', '/forgot-password'].includes(location.pathname);
  const effectiveTheme = isPublicLandingPage || isPublicAuthPage ? 'dark' : theme;

  useEffect(() => {
    document.documentElement.dataset.theme = effectiveTheme;
    document.documentElement.style.colorScheme = effectiveTheme;
  }, [effectiveTheme]);

  return null;
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [showLoader, setShowLoader] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !window.sessionStorage.getItem('investwise-loader-seen');
  });

  useEffect(() => {
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
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ThemeController theme={theme} />
        <ClickSpark sparkColor="#818cf8" sparkSize={12} sparkRadius={20} sparkCount={10} duration={500} />
        {showLoader && <WebsiteLoader onFinished={handleLoaderFinished} />}
        <AppRoutes theme={theme} onToggleTheme={handleToggleTheme} />
      </AuthProvider>
    </BrowserRouter>
  );
}
