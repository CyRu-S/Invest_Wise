import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          💎 InvestWise
        </Link>

        <div className="navbar-links">
          <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
          <Link to="/funds" className={isActive('/funds')}>Mutual Funds</Link>

          {hasRole('INVESTOR') && (
            <>
              <Link to="/risk-profiler" className={isActive('/risk-profiler')}>Risk Profiler</Link>
              <Link to="/portfolio" className={isActive('/portfolio')}>Portfolio</Link>
              <Link to="/advisors" className={isActive('/advisors')}>Advisors</Link>
            </>
          )}

          {hasRole('ADMIN') && (
            <Link to="/admin" className={isActive('/admin')}>Admin Panel</Link>
          )}
        </div>

        <div className="navbar-user">
          <span className="user-badge">{user?.role}</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {user?.fullName}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
