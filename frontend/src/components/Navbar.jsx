import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  Database,
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import SkyToggle from './ui/sky-toggle';
import { prefetchRouteSessionData } from '../services/appDataCache';

function maskName(name) {
  if (!name) return '';
  const visible = name.slice(0, 5);
  return visible + '*****';
}

const navItems = {
  common: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Mutual Funds', path: '/funds', icon: TrendingUp },
  ],
  INVESTOR: [
    { name: 'Portfolio', path: '/portfolio', icon: Briefcase },
    { name: 'Advisors', path: '/advisors', icon: Users },
  ],
  ADVISOR: [
    { name: 'Appointments', path: '/appointments', icon: CalendarDays },
  ],
  ANALYST: [
    { name: 'Data Management', path: '/data-management', icon: Database },
  ],
  ADMIN: [
    { name: 'Data Management', path: '/data-management', icon: Database },
    { name: 'Admin Panel', path: '/admin', icon: Settings },
  ],
};

export default function Navbar({ theme, onToggleTheme }) {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const items = [
    ...navItems.common,
    ...(hasRole('INVESTOR') ? navItems.INVESTOR : []),
    ...(hasRole('ADVISOR') ? navItems.ADVISOR : []),
    ...(hasRole('ANALYST') ? navItems.ANALYST : []),
    ...(hasRole('ADMIN') ? navItems.ADMIN : []),
  ];

  const handleLinkWarmup = (path) => {
    prefetchRouteSessionData(path, user?.role);
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <img src="/favicon.svg" alt="InvestWise" className="navbar-brand__mark"/>
          <span className="navbar-brand__wordmark" aria-label="InvestWise">
            <span className="navbar-brand__word">Invest</span>
            <span className="navbar-brand__word navbar-brand__word--accent">Wise</span>
          </span>
        </Link>

        <div className="tubelight-nav navbar-desktop-nav">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`tubelight-tab${isActive ? ' active' : ''}`}
                onMouseEnter={() => handleLinkWarmup(item.path)}
                onFocus={() => handleLinkWarmup(item.path)}
              >
                <span className="tubelight-tab-text">{item.name}</span>
                <span className="tubelight-tab-icon">
                  <Icon size={18} strokeWidth={2.5} />
                </span>
                {isActive && (
                  <motion.div
                    layoutId="tubelight-lamp"
                    className="tubelight-indicator"
                    initial={false}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    <div className="tubelight-bar">
                      <div className="tubelight-glow-1" />
                      <div className="tubelight-glow-2" />
                      <div className="tubelight-glow-3" />
                    </div>
                  </motion.div>
                )}
              </Link>
            );
          })}
        </div>

        <div className="navbar-user navbar-desktop-user">
          <SkyToggle
            checked={theme === 'dark'}
            onChange={onToggleTheme}
            ariaLabel={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          />
          <span className="user-badge">{user?.role}</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {maskName(user?.fullName)}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="logout-btn">
            <LogOut size={14} />
            Logout
          </button>
        </div>

        <div className="navbar-mobile-controls">
          <SkyToggle
            checked={theme === 'dark'}
            onChange={onToggleTheme}
            ariaLabel={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            size="compact"
          />
          <span className="user-badge navbar-mobile-role">{user?.role}</span>
          <button
            type="button"
            className="navbar-mobile-toggle"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen ? (
          <motion.div
            className="navbar-mobile-panel"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="navbar-mobile-panel__user">
              <div className="navbar-mobile-panel__identity">
                <span className="user-badge">{user?.role}</span>
                <div>
                  <p className="navbar-mobile-panel__name">{maskName(user?.fullName)}</p>
                  <p className="navbar-mobile-panel__label">Signed in workspace</p>
                </div>
              </div>
            </div>

            <div className="navbar-mobile-panel__links">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`navbar-mobile-link${isActive ? ' active' : ''}`}
                    onMouseEnter={() => handleLinkWarmup(item.path)}
                    onFocus={() => handleLinkWarmup(item.path)}
                  >
                    <span className="navbar-mobile-link__icon">
                      <Icon size={17} strokeWidth={2.3} />
                    </span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <button className="navbar-mobile-logout" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}
