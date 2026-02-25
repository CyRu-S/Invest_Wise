import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdvisorHub() {
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/advisors')
      .then(r => setAdvisors(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;

  return (
    <div className="page-container" id="advisor-hub-page">
      <div className="page-header">
        <h1>Financial Advisors</h1>
        <p>Connect with certified professionals to guide your investment journey</p>
      </div>

      <div className="grid-2">
        {advisors.map(advisor => (
          <div key={advisor.id} className="glass-card advisor-card">
            <div className="advisor-meta">
              <div className="advisor-avatar">
                {advisor.name?.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{advisor.name}</h3>
                <span className="badge badge-info">{advisor.specialization}</span>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              {advisor.bio}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span style={{ color: '#fcd34d', fontSize: '1.1rem' }}>{renderStars(advisor.averageRating)}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                  {advisor.averageRating} ({advisor.totalReviews} reviews)
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {advisor.experienceYears}+ years exp.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
              <div className="advisor-fee">
                ${Number(advisor.consultationFee).toFixed(2)}<span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}> /session</span>
              </div>
              <button className="btn btn-primary" onClick={() => alert('Stripe payment would be triggered here. Configure your Stripe keys to enable this feature.')}>
                Hire Advisor
              </button>
            </div>
          </div>
        ))}
      </div>

      {advisors.length === 0 && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No advisors available yet.</p>
        </div>
      )}
    </div>
  );
}
