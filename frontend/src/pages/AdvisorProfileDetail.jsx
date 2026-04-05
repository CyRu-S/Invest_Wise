import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Clock3,
  FileText,
  Sparkles,
  Star,
  Wallet,
} from 'lucide-react';
import { MagicBentoCard, MagicBentoGrid } from '../components/MagicBentoGrid';
import api from '../services/api';
import './AdvisorRiskPages.css';

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '₹0';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDateTime(value) {
  if (!value) return 'Schedule pending';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsed);
}

function getInitials(name) {
  return (
    name
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  );
}

function renderStars(rating) {
  const normalizedRating = Math.max(0, Math.min(5, Number(rating || 0)));
  const fullStars = Math.round(normalizedRating);
  return `${'★'.repeat(fullStars)}${'☆'.repeat(5 - fullStars)}`;
}

export default function AdvisorProfileDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [advisor, setAdvisor] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [manualSchedule, setManualSchedule] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadAdvisor = async () => {
    setLoading(true);

    try {
      const [advisorResponse, profileResponse] = await Promise.all([
        api.get(`/advisors/${id}`),
        api.get('/investor/profile'),
      ]);

      setAdvisor(advisorResponse.data);
      setProfile(profileResponse.data);
    } catch (error) {
      console.error(error);
      navigate('/advisors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvisor();
  }, [id, navigate]);

  useEffect(() => {
    document.body.classList.toggle('modal-open', bookingModalOpen);

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [bookingModalOpen]);

  const availableSlots = useMemo(() => {
    return (advisor?.availability || [])
      .filter((slot) => !slot.booked)
      .filter((slot) => new Date(slot.startTime).getTime() > Date.now())
      .sort((left, right) => new Date(left.startTime).getTime() - new Date(right.startTime).getTime());
  }, [advisor]);

  const walletBalance = Number(profile?.walletBalance || 0);
  const consultationFee = Number(advisor?.consultationFee || 0);
  const hasEnoughBalance = walletBalance >= consultationFee;
  const selectedSlot = availableSlots.find((slot) => String(slot.id) === String(selectedSlotId));

  const handleBook = async () => {
    if (!advisor) return;
    if (!hasEnoughBalance) {
      setMessage({
        type: 'error',
        text: 'Add more funds to your wallet before confirming this consultation.',
      });
      return;
    }

    const payload = {
      notes: bookingNotes,
    };

    if (selectedSlotId) {
      payload.availabilitySlotId = Number(selectedSlotId);
      payload.scheduledAt = selectedSlot?.startTime;
    } else if (manualSchedule) {
      payload.scheduledAt = manualSchedule;
    } else {
      setMessage({ type: 'error', text: 'Choose an available slot or enter a preferred time.' });
      return;
    }

    setBookingLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post(`/advisors/${id}/book`, payload);
      setMessage({
        type: 'success',
        text: response.data?.message || 'Appointment booked successfully.',
      });
      setBookingModalOpen(false);
      setSelectedSlotId('');
      setManualSchedule('');
      setBookingNotes('');
      await loadAdvisor();
    } catch (error) {
      console.error(error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to complete this booking right now.',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container insight-page advisor-detail-page">
        <div className="insight-loading-shell">
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        </div>
      </div>
    );
  }

  if (!advisor) return null;

  const initials = getInitials(advisor.name);

  return (
    <div className="page-container insight-page advisor-detail-page" id="advisor-detail-page">
      <Link to="/advisors" className="advisor-detail__back">
        <ArrowLeft size={16} />
        Back to advisors
      </Link>

      {message.text ? (
        <div className={`advisor-appointments-feedback advisor-appointments-feedback--${message.type}`}>
          {message.text}
        </div>
      ) : null}

      <section className="insight-hero advisor-detail-hero">
        <div className="insight-hero__copy">
          <span className="insight-hero__kicker">
            <Sparkles size={16} />
            Advisor Profile
          </span>
          <div className="advisor-detail-identity">
            <div className="advisor-avatar advisor-detail-identity__avatar">{initials}</div>
            <div className="advisor-detail-identity__copy">
              <span className="advisor-card__eyebrow">
                <BadgeCheck size={15} />
                Verified advisor
              </span>
              <h1>{advisor.name}</h1>
              <span className="advisor-card__pill">{advisor.specialization || 'General financial planning'}</span>
            </div>
          </div>
          <p>{advisor.bio || 'Practical portfolio guidance, planning support, and tailored market insights.'}</p>
          <div className="advisor-detail-rating">
            <span>{renderStars(advisor.averageRating)}</span>
            <strong>{Number(advisor.averageRating || 0).toFixed(1)}</strong>
            <small>{advisor.totalReviews || 0} reviews</small>
          </div>
        </div>

        <div className="insight-hero__summary advisor-detail-summary">
          <div className="insight-hero__stat insight-hero__stat--indigo">
            <span>Session fee</span>
            <strong>{formatCurrency(advisor.consultationFee)}</strong>
          </div>
          <div className="insight-hero__stat insight-hero__stat--indigo">
            <span>Wallet balance</span>
            <strong>{formatCurrency(profile?.walletBalance)}</strong>
          </div>
          <div className="insight-hero__stat insight-hero__stat--indigo">
            <span>Experience</span>
            <strong>{advisor.experienceYears || 0}+ yrs</strong>
          </div>
          <div className="insight-hero__stat insight-hero__stat--indigo">
            <span>Open slots</span>
            <strong>{availableSlots.length}</strong>
          </div>
        </div>
      </section>

      <section className="advisor-detail-layout">
        <MagicBentoGrid className="advisor-detail-grid" pattern="uniform" glowColor="99, 102, 241" spotlightRadius={280}>
          <MagicBentoCard className="advisor-detail-card advisor-detail-card--overview" clickEffect={false}>
            <div className="advisor-detail-card__header">
              <span className="advisor-section-head__eyebrow">
                <FileText size={16} />
                Session coverage
              </span>
            </div>
            <div className="advisor-detail-card__body">
              <h2>Book directly from your wallet without leaving the advisory workspace.</h2>
              <p>
                Choose a published availability slot or suggest a time, add discussion notes, and confirm the fee from your existing wallet balance.
              </p>
            </div>
            <div className="advisor-detail-benefits">
              {[
                'One-on-one planning consultation',
                'Personalized investment discussion',
                'Portfolio and risk review support',
                'Actionable follow-up notes for your next move',
              ].map((benefit) => (
                <div key={benefit} className="advisor-detail-benefit">
                  <BadgeCheck size={15} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </MagicBentoCard>

          <MagicBentoCard className="advisor-detail-card advisor-detail-card--booking" clickEffect={false}>
            <div className="advisor-detail-card__header">
              <span className="advisor-section-head__eyebrow">
                <Wallet size={16} />
                Wallet checkout
              </span>
            </div>
            <div className="advisor-detail-card__body">
              <h3>{formatCurrency(advisor.consultationFee)}</h3>
              <p>
                {hasEnoughBalance
                  ? 'Your wallet is funded for this consultation.'
                  : 'Your wallet balance is below the consultation fee.'}
              </p>
            </div>
            <div className="advisor-detail-checkout">
              <div>
                <span>Wallet balance</span>
                <strong>{formatCurrency(profile?.walletBalance)}</strong>
              </div>
              <div>
                <span>Contact</span>
                <strong>{advisor.email}</strong>
              </div>
            </div>
            <div className="advisor-detail-card__actions">
              <button
                type="button"
                className="advisor-card__action advisor-card__action--secondary advisor-detail-card__cta"
                disabled={!hasEnoughBalance}
                onClick={() => setBookingModalOpen(true)}
              >
                <CalendarDays size={16} />
                Confirm & pay from wallet
              </button>
              {!hasEnoughBalance ? (
                <Link to="/portfolio" className="advisor-detail-card__link">
                  Add wallet funds first
                </Link>
              ) : null}
            </div>
          </MagicBentoCard>
        </MagicBentoGrid>
      </section>

      <section className="advisor-detail-section">
        <div className="advisor-section-head">
          <div>
            <span className="advisor-section-head__eyebrow">
              <Clock3 size={16} />
              Availability
            </span>
            <h2>Choose from the published consultation slots.</h2>
          </div>
        </div>

        {availableSlots.length ? (
          <MagicBentoGrid className="advisor-detail-slots" pattern="uniform" glowColor="99, 102, 241" spotlightRadius={260}>
            {availableSlots.map((slot) => (
              <MagicBentoCard key={slot.id} className="advisor-detail-slot" clickEffect>
                <div className="advisor-detail-slot__top">
                  <span className="advisor-card__eyebrow">
                    <CalendarDays size={15} />
                    Open slot
                  </span>
                  <strong>{formatDateTime(slot.startTime)}</strong>
                </div>
                <p>Ends {formatDateTime(slot.endTime)}</p>
                <button
                  type="button"
                  className="advisor-detail-slot__button"
                  onClick={() => {
                    setBookingModalOpen(true);
                    setSelectedSlotId(String(slot.id));
                    setManualSchedule('');
                  }}
                >
                  Select this time
                </button>
              </MagicBentoCard>
            ))}
          </MagicBentoGrid>
        ) : (
          <MagicBentoCard className="advisor-empty" clickEffect={false}>
            <div>
              <span className="advisor-section-head__eyebrow">
                <Clock3 size={16} />
                No open slots
              </span>
              <h2 style={{ marginTop: '0.7rem' }}>This advisor has not published open times yet.</h2>
              <p>You can still suggest a preferred time from the booking flow and let the advisor confirm it later.</p>
            </div>
          </MagicBentoCard>
        )}
      </section>

      {bookingModalOpen ? (
        <div className="advisor-detail-modal-overlay" onClick={() => setBookingModalOpen(false)}>
          <div className="advisor-detail-modal" onClick={(event) => event.stopPropagation()}>
            <div className="advisor-detail-modal__header">
              <div>
                <span className="advisor-card__eyebrow">
                  <Wallet size={15} />
                  Wallet booking
                </span>
                <h3>Book {advisor.name}</h3>
                <p>Choose a live slot or enter a preferred time. The consultation fee will be deducted from your wallet immediately.</p>
              </div>
              <button className="portfolio-modal__close" onClick={() => setBookingModalOpen(false)}>
                Close
              </button>
            </div>

            <div className="advisor-detail-modal__summary">
              <div>
                <span>Consultation fee</span>
                <strong>{formatCurrency(advisor.consultationFee)}</strong>
              </div>
              <div>
                <span>Wallet balance</span>
                <strong>{formatCurrency(profile?.walletBalance)}</strong>
              </div>
            </div>

            {availableSlots.length ? (
              <label className="advisor-detail-modal__field" htmlFor="advisor-slot-select">
                <span>Available slot</span>
                <select
                  id="advisor-slot-select"
                  value={selectedSlotId}
                  onChange={(event) => {
                    setSelectedSlotId(event.target.value);
                    if (event.target.value) setManualSchedule('');
                  }}
                >
                  <option value="">Choose an open slot</option>
                  {availableSlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {formatDateTime(slot.startTime)} to {formatDateTime(slot.endTime)}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="advisor-detail-modal__field" htmlFor="advisor-manual-time">
              <span>Preferred time</span>
              <input
                id="advisor-manual-time"
                type="datetime-local"
                value={manualSchedule}
                onChange={(event) => {
                  setManualSchedule(event.target.value);
                  if (event.target.value) setSelectedSlotId('');
                }}
              />
            </label>

            <label className="advisor-detail-modal__field" htmlFor="advisor-booking-notes">
              <span>Notes</span>
              <textarea
                id="advisor-booking-notes"
                rows="4"
                value={bookingNotes}
                onChange={(event) => setBookingNotes(event.target.value)}
                placeholder="What would you like to discuss during this consultation?"
              />
            </label>

            {!hasEnoughBalance ? (
              <div className="advisor-detail-modal__warning">
                Add more funds to your wallet before confirming this session.
              </div>
            ) : null}

            <div className="advisor-detail-modal__actions">
              <button
                type="button"
                className="advisor-card__action advisor-card__action--secondary advisor-detail-card__cta"
                disabled={bookingLoading || !hasEnoughBalance}
                onClick={handleBook}
              >
                <Wallet size={16} />
                {bookingLoading ? 'Processing...' : 'Confirm booking'}
              </button>
              <button type="button" className="advisor-card__action advisor-card__action--primary" onClick={() => setBookingModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
