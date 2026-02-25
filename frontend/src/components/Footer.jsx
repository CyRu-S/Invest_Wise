import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="navbar-brand" style={{ fontSize: '1.2rem' }}>💎 InvestWise</span>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.75rem', lineHeight: 1.7 }}>
              FSAD-PS06 — Investment Perception and Selection Behavior Towards Mutual Funds.
              A full-stack decision support system.
            </p>
          </div>

          <div>
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-links">
              <li><Link to="/funds">Explore Funds</Link></li>
              {isAuthenticated && <li><Link to="/dashboard">Dashboard</Link></li>}
              {!isAuthenticated && <li><Link to="/register">Get Started</Link></li>}
              {!isAuthenticated && <li><Link to="/login">Sign In</Link></li>}
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Features</h4>
            <ul className="footer-links">
              <li><Link to="/risk-profiler">Risk Profiler</Link></li>
              <li><Link to="/advisors">Advisors</Link></li>
              <li><Link to="/portfolio">Portfolio</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Tech Stack</h4>
            <ul className="footer-links">
              <li><span>Spring Boot 3 + Java 17</span></li>
              <li><span>React 18 + Vite 5</span></li>
              <li><span>MySQL + JPA/Hibernate</span></li>
              <li><span>JWT + Spring Security</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; 2026 InvestWise. Built for FSAD-PS06.</span>
          <span style={{ color: 'var(--text-muted)' }}>
            Made with React, Spring Boot &amp; ☕
          </span>
        </div>
      </div>
    </footer>
  );
}
