import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const [profile, setProfile] = useState(null);
  const [funds, setFunds] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/funds/public').then(r => setFunds(r.data)).catch(() => {});

    if (hasRole('INVESTOR')) {
      api.get('/investor/profile').then(r => setProfile(r.data)).catch(() => {});
    }
    if (hasRole('ADMIN')) {
      api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
    }
  }, []);

  const formatCurrency = (val) => {
    if (!val && val !== 0) return '₹0';
    return '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };

  return (
    <div className="page-container" id="dashboard-page">
      <div className="page-header">
        <h1>Welcome back, {user?.fullName} 👋</h1>
        <p>Here's an overview of your investment platform</p>
      </div>

      {/* Investor Dashboard */}
      {hasRole('INVESTOR') && profile && (
        <>
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            <div className="glass-card stat-card">
              <div className="stat-label">Wallet Balance</div>
              <div className="stat-value">{formatCurrency(profile.walletBalance)}</div>
            </div>
            <div className="glass-card stat-card">
              <div className="stat-label">Risk Score</div>
              <div className="stat-value">{profile.riskToleranceScore}/100</div>
            </div>
            <div className="glass-card stat-card">
              <div className="stat-label">Risk Category</div>
              <div className="stat-value" style={{ fontSize: '1.2rem' }}>{profile.riskCategory || 'Not Set'}</div>
            </div>
            <div className="glass-card stat-card">
              <div className="stat-label">Available Funds</div>
              <div className="stat-value">{funds.length}</div>
            </div>
          </div>

          <div className="grid-3">
            <Link to="/risk-profiler" className="glass-card" style={{ textDecoration: 'none' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>🧠 Risk Profiler</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Discover your investment personality through our behavioral questionnaire
              </p>
            </Link>
            <Link to="/funds" className="glass-card" style={{ textDecoration: 'none' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>📈 Explore Funds</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Browse mutual funds matched to your risk profile
              </p>
            </Link>
            <Link to="/portfolio" className="glass-card" style={{ textDecoration: 'none' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>💼 My Portfolio</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Track your investments and transaction history
              </p>
            </Link>
          </div>
        </>
      )}

      {/* Advisor Dashboard */}
      {hasRole('ADVISOR') && (
        <div className="grid-3">
          <div className="glass-card stat-card">
            <div className="stat-label">Your Role</div>
            <div className="stat-value" style={{ fontSize: '1.2rem' }}>Financial Advisor</div>
          </div>
          <Link to="/funds" className="glass-card" style={{ textDecoration: 'none' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>📈 View Funds</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Browse available mutual funds and their analytics</p>
          </Link>
          <div className="glass-card">
            <h3 style={{ marginBottom: '0.5rem' }}>📅 Appointments</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage your client consultations (Coming Soon)</p>
          </div>
        </div>
      )}

      {/* Analyst Dashboard */}
      {hasRole('ANALYST') && (
        <div className="grid-3">
          <div className="glass-card stat-card">
            <div className="stat-label">Total Funds</div>
            <div className="stat-value">{funds.length}</div>
          </div>
          <Link to="/funds" className="glass-card" style={{ textDecoration: 'none' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>📊 Fund Analytics</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>View detailed CAGR, Sharpe Ratio, and NAV charts</p>
          </Link>
          <div className="glass-card">
            <h3 style={{ marginBottom: '0.5rem' }}>📤 Data Management</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Upload and manage fund data (Coming Soon)</p>
          </div>
        </div>
      )}

      {/* Admin Dashboard */}
      {hasRole('ADMIN') && stats && (
        <>
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            <div className="glass-card stat-card">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{stats.totalUsers}</div>
            </div>
            <div className="glass-card stat-card">
              <div className="stat-label">Investors</div>
              <div className="stat-value">{stats.investors}</div>
            </div>
            <div className="glass-card stat-card">
              <div className="stat-label">Advisors</div>
              <div className="stat-value">{stats.advisors}</div>
            </div>
            <div className="glass-card stat-card">
              <div className="stat-label">Analysts</div>
              <div className="stat-value">{stats.analysts}</div>
            </div>
          </div>

          <div className="grid-2">
            <Link to="/admin" className="glass-card" style={{ textDecoration: 'none' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>👥 User Management</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage user accounts and roles</p>
            </Link>
            <Link to="/funds" className="glass-card" style={{ textDecoration: 'none' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>💎 Fund Management</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>View and manage mutual fund data</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
