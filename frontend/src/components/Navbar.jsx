import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  ShieldCheck,
  Briefcase,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';

const navItems = {
  common: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Mutual Funds', path: '/funds', icon: TrendingUp },
  ],
  INVESTOR: [
    { name: 'Portfolio', path: '/portfolio', icon: Briefcase },
    { name: 'Risk Profiler', path: '/risk-profiler', icon: ShieldCheck },
    { name: 'Advisors', path: '/advisors', icon: Users },
  ],
  ADMIN: [
    { name: 'Admin Panel', path: '/admin', icon: Settings },
  ],
};

export default function Navbar() {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  const items = [
    ...navItems.common,
    ...(hasRole('INVESTOR') ? navItems.INVESTOR : []),
    ...(hasRole('ADMIN') ? navItems.ADMIN : []),
  ];

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

        <div className="tubelight-nav">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`tubelight-tab${isActive ? ' active' : ''}`}
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

        <div className="navbar-user">
          <span className="user-badge">{user?.role}</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {user?.fullName}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="logout-btn">
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
