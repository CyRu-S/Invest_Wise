import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdvisorProfileDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [advisor, setAdvisor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get(`/advisors/${id}`)
      .then(r => setAdvisor(r.data))
      .catch(() => navigate('/advisors'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    setMessage({ type: '', text: '' });
    try {
      await api.post(`/advisors/${id}/book`, {
        scheduledAt: bookingDate,
        notes: bookingNotes
      });
      setMessage({ type: 'success', text: 'Appointment booked successfully!' });
      setBookingModal(false);
      setBookingDate('');
      setBookingNotes('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Booking failed' });
    }
  };

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  if (!advisor) return null;

  const initials = advisor.name?.split(' ').map(n => n[0]).join('') || '?';

  return (
    <div className="page-container" id="advisor-detail-page">
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/advisors')} style={{ marginBottom: '1rem' }}>
        ← Back to Advisors
      </button>

      {message.text && <div className={message.type === 'success' ? 'success-message' : 'error-message'}>{message.text}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Main Content */}
        <div>
          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div className="advisor-avatar" style={{ width: 80, height: 80, fontSize: '1.75rem' }}>
                {initials}
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>{advisor.name}</h1>
                <span className="badge badge-info" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
                  {advisor.specialization}
                </span>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                  <div>
                    <span style={{ color: '#fcd34d', fontSize: '1.1rem' }}>{renderStars(advisor.averageRating)}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                      {advisor.averageRating} ({advisor.totalReviews} reviews)
                    </span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {advisor.experienceYears}+ years experience
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>📋 About</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem' }}>
              {advisor.bio || 'No bio available.'}
            </p>
          </div>

          {/* Stats */}
          <div className="grid-3">
            <div className="glass-card stat-card">
              <div className="stat-label">Specialization</div>
              <div className="stat-value" style={{ fontSize: '1rem' }}>{advisor.specialization || '—'}</div>
            </div>
            <div className="glass-card stat-card">
              <div className="stat-label">Experience</div>
              <div className="stat-value">{advisor.experienceYears}+<span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}> years</span></div>
            </div>
            <div className="glass-card stat-card">
              <div className="stat-label">Client Reviews</div>
              <div className="stat-value">{advisor.totalReviews}</div>
            </div>
          </div>
        </div>

        {/* Sidebar — Hire Panel */}
        <div className="glass-card" style={{ position: 'sticky', top: '80px' }}>
          <h3 style={{ marginBottom: '1rem' }}>📅 Book Consultation</h3>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div className="advisor-fee" style={{ fontSize: '2rem' }}>
              ${Number(advisor.consultationFee).toFixed(2)}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>per session</div>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
            {['One-on-one video consultation', 'Personalized investment strategy', 'Portfolio review & optimization', 'Risk assessment guidance'].map((item, i) => (
              <li key={i} style={{ padding: '0.4rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                ✓ {item}
              </li>
            ))}
          </ul>

          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => setBookingModal(true)}>
            Book Appointment
          </button>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.75rem', textAlign: 'center' }}>
            Contact: {advisor.email}
          </p>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingModal && (
        <div className="modal-overlay" onClick={() => setBookingModal(false)}>
          <div className="glass-card modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem' }}>Book {advisor.name}</h3>

            <div className="form-group">
              <label>Preferred Date & Time</label>
              <input type="datetime-local" className="form-control"
                value={bookingDate} onChange={e => setBookingDate(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea className="form-control" rows={3} placeholder="Describe what you'd like to discuss..."
                value={bookingNotes} onChange={e => setBookingNotes(e.target.value)}
                style={{ resize: 'vertical' }} />
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Fee: <strong>${Number(advisor.consultationFee).toFixed(2)}</strong> (charged via Stripe)
            </p>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" onClick={handleBook} disabled={!bookingDate}>Confirm Booking</button>
              <button className="btn btn-ghost" onClick={() => setBookingModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
