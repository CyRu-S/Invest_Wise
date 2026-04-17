import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  CalendarRange,
  ChevronDown,
  ChevronUp,
  Clock3,
  CircleOff,
  FileText,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
} from 'lucide-react';
import { MagicBentoCard, MagicBentoGrid } from '../components/MagicBentoGrid';
import api from '../services/api';
import {
  fetchAdvisorAvailability,
  fetchAdvisorDetailBundle,
  fetchAdvisorHubBundle,
  fetchAdvisorWorkspaceBundle,
  fetchInvestorBundle,
  getCachedAdvisorAvailability,
  getCachedAdvisorHubBundle,
} from '../services/appDataCache';
import './PortfolioPage.css';
import './AdvisorRiskPages.css';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getInitials(name) {
  return name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';
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

export default function AdvisorHub() {
  const [advisors, setAdvisors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsOpen, setAppointmentsOpen] = useState(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [rescheduleNotes, setRescheduleNotes] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const applyAdvisorHubBundle = (bundle) => {
    setAdvisors(bundle?.advisors || []);
    setAppointments(bundle?.appointments || []);
  };

  const loadAdvisorHub = async ({
    forceRefresh = false,
    background = false,
    showAppointmentsLoader = false,
  } = {}) => {
    if (!background) {
      setLoading(true);
    }

    if (showAppointmentsLoader) {
      setAppointmentsLoading(true);
    }

    try {
      const { data } = await fetchAdvisorHubBundle({ forceRefresh });
      applyAdvisorHubBundle(data);
      setAppointmentsError('');
    } catch (error) {
      console.error(error);
      setAppointmentsError('Unable to load your bookings right now.');
    } finally {
      if (!background) {
        setLoading(false);
      }

      if (showAppointmentsLoader) {
        setAppointmentsLoading(false);
      }
    }
  };

  useEffect(() => {
    const cachedBundle = getCachedAdvisorHubBundle();

    if (cachedBundle) {
      applyAdvisorHubBundle(cachedBundle);
      setLoading(false);
      loadAdvisorHub({ forceRefresh: true, background: true });
      return;
    }

    loadAdvisorHub();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('modal-open', Boolean(rescheduleModal));

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [rescheduleModal]);

  const refreshInvestorAdvisorCaches = async (advisorId) => {
    await Promise.allSettled([
      fetchAdvisorHubBundle({ forceRefresh: true }),
      fetchInvestorBundle({ forceRefresh: true }),
      fetchAdvisorWorkspaceBundle({ forceRefresh: true }),
      advisorId ? fetchAdvisorAvailability(advisorId, { forceRefresh: true }) : Promise.resolve(),
      advisorId ? fetchAdvisorDetailBundle(advisorId, { forceRefresh: true }) : Promise.resolve(),
    ]);
  };

  const handleToggleAppointments = async () => {
    const nextOpen = !appointmentsOpen;
    setAppointmentsOpen(nextOpen);

    if (nextOpen && !appointmentsLoading) {
      await loadAdvisorHub({
        forceRefresh: true,
        background: true,
        showAppointmentsLoader: true,
      });
    }
  };

  const handleCancelAppointment = async (appointment) => {
    setActionLoadingId(`cancel:${appointment.id}`);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.patch(`/advisors/appointments/${appointment.id}/cancel`);
      setAppointments((currentAppointments) =>
        currentAppointments.map((item) => (item.id === appointment.id ? response.data : item))
      );
      setMessage({ type: 'success', text: 'Booking cancelled and wallet amount refunded.' });
      await refreshInvestorAdvisorCaches(appointment.advisorId);
    } catch (error) {
      console.error(error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to cancel this booking right now.',
      });
    } finally {
      setActionLoadingId('');
    }
  };

  const openRescheduleModal = async (appointment) => {
    setRescheduleModal(appointment);
    setRescheduleNotes(appointment.notes || '');
    setRescheduleTime('');
    setRescheduleSlots([]);
    setMessage({ type: '', text: '' });

    const cachedAvailability = getCachedAdvisorAvailability(appointment.advisorId);
    if (cachedAvailability) {
      const openSlots = cachedAvailability
        .filter((slot) => !slot.booked)
        .filter((slot) => new Date(slot.startTime).getTime() > Date.now());
      setRescheduleSlots(openSlots);
    }

    try {
      const { data } = await fetchAdvisorAvailability(appointment.advisorId, {
        forceRefresh: Boolean(cachedAvailability),
      });
      const openSlots = data
        .filter((slot) => !slot.booked)
        .filter((slot) => new Date(slot.startTime).getTime() > Date.now());
      setRescheduleSlots(openSlots);
    } catch (error) {
      console.error(error);
      setMessage({
        type: 'error',
        text: 'Unable to load advisor availability for rescheduling.',
      });
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleModal) return;

    const payload = {
      notes: rescheduleNotes,
    };

    if (rescheduleTime && String(rescheduleTime).startsWith('slot:')) {
      payload.availabilitySlotId = Number(rescheduleTime.replace('slot:', ''));
      const matchedSlot = rescheduleSlots.find((slot) => String(slot.id) === String(payload.availabilitySlotId));
      payload.scheduledAt = matchedSlot?.startTime;
    } else if (rescheduleTime) {
      payload.scheduledAt = rescheduleTime;
    } else {
      setMessage({ type: 'error', text: 'Choose a new slot or enter a preferred time first.' });
      return;
    }

    setRescheduleLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.patch(`/advisors/appointments/${rescheduleModal.id}/reschedule`, payload);
      setAppointments((currentAppointments) =>
        currentAppointments.map((item) => (item.id === rescheduleModal.id ? response.data : item))
      );
      setMessage({ type: 'success', text: 'Booking rescheduled successfully.' });
      setRescheduleModal(null);
      setRescheduleSlots([]);
      setRescheduleNotes('');
      setRescheduleTime('');
      await refreshInvestorAdvisorCaches(rescheduleModal.advisorId);
    } catch (error) {
      console.error(error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to reschedule this booking right now.',
      });
    } finally {
      setRescheduleLoading(false);
    }
  };

  const summary = useMemo(() => {
    if (!advisors.length) {
      return {
        total: 0,
        averageRating: 0,
        averageFee: 0,
        specializations: 0,
      };
    }

    const totalRating = advisors.reduce(
      (sum, advisor) => sum + Number(advisor.averageRating || 0),
      0
    );
    const totalFee = advisors.reduce(
      (sum, advisor) => sum + Number(advisor.consultationFee || 0),
      0
    );
    const specializationCount = new Set(
      advisors.map((advisor) => advisor.specialization).filter(Boolean)
    ).size;

    return {
      total: advisors.length,
      averageRating: totalRating / advisors.length,
      averageFee: totalFee / advisors.length,
      specializations: specializationCount,
    };
  }, [advisors]);

  if (loading) {
    return (
      <div className="page-container insight-page advisor-hub-page">
        <div className="insight-loading-shell">
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container insight-page advisor-hub-page" id="advisor-hub-page">

      <section className="insight-hero">
        <div className="insight-hero__copy">
          <span className="insight-hero__kicker">
            <Sparkles size={16} />
            Advisor Matchmaking
          </span>
          <h1>Find experienced guidance for allocation, review, and investment decisions.</h1>
          <p>
            Browse certified advisors, compare rating and specialization signals, and move from
            self-serve investing into expert-backed planning when you need a second brain.
          </p>
          <div className="insight-hero__chips">
            <span className="insight-chip">Investor-only access</span>
            <span className="insight-chip">Profile-first discovery</span>
          </div>
        </div>

        <div className="advisor-hub__hero-rail">
          <div className="insight-hero__summary advisor-hub__summary">
            <div className="insight-hero__stat insight-hero__stat--indigo">
              <span>Advisors live</span>
              <strong>{summary.total}</strong>
            </div>
            <div className="insight-hero__stat insight-hero__stat--indigo">
              <span>Average rating</span>
              <strong>{summary.averageRating.toFixed(1)}</strong>
            </div>
            <div className="insight-hero__stat insight-hero__stat--indigo">
              <span>Average fee</span>
              <strong>{formatCurrency(summary.averageFee)}</strong>
            </div>
            <div className="insight-hero__stat insight-hero__stat--indigo">
              <span>Specializations</span>
              <strong>{summary.specializations}</strong>
            </div>
          </div>

          <button className="advisor-bookings-toggle" onClick={handleToggleAppointments}>
            <span>
              <CalendarDays size={16} />
              Show Bookings
            </span>
            {appointmentsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </section>

      {message.text ? (
        <div className={`advisor-appointments-feedback advisor-appointments-feedback--${message.type}`}>
          {message.text}
        </div>
      ) : null}

      {appointmentsOpen && (
        <section className="advisor-bookings-panel">
          <div className="advisor-bookings-panel__header">
            <div>
              <span className="advisor-section-head__eyebrow">
                <CalendarDays size={16} />
                Your Advisor Bookings
              </span>
              <h2>Track consultations you have already scheduled.</h2>
            </div>
            <p>
              Review the advisor, session timing, and current booking status without leaving the
              directory.
            </p>
          </div>

          {appointmentsLoading ? (
            <div className="advisor-bookings-panel__state">
              <div className="loading-spinner">
                <div className="spinner" />
              </div>
            </div>
          ) : appointmentsError ? (
            <div className="advisor-bookings-panel__state">
              <p>{appointmentsError}</p>
            </div>
          ) : appointments.length ? (
            <MagicBentoGrid
              className="advisor-bookings-grid"
              pattern="uniform"
              glowColor="99, 102, 241"
              spotlightRadius={260}
            >
              {appointments.map((appointment) => (
                <MagicBentoCard
                  key={appointment.id}
                  className="advisor-booking-card"
                  particleCount={6}
                >
                  <div className="advisor-booking-card__top">
                    <div>
                      <span className="advisor-card__eyebrow">
                        <BadgeCheck size={15} />
                        {appointment.specialization || 'Advisor session'}
                      </span>
                      <h3>{appointment.advisorName}</h3>
                    </div>
                    <span className={`advisor-booking-card__status advisor-booking-card__status--${appointment.status?.toLowerCase()}`}>
                      {appointment.status}
                    </span>
                  </div>

                  <div className="advisor-booking-card__meta">
                    <div>
                      <span>
                        <Clock3 size={15} />
                        Scheduled
                      </span>
                      <strong>{formatDateTime(appointment.scheduledAt)}</strong>
                    </div>
                    <div>
                      <span>
                        <FileText size={15} />
                        Notes
                      </span>
                      <strong>{appointment.notes || 'No notes added yet'}</strong>
                    </div>
                  </div>

                  {['PENDING', 'CONFIRMED'].includes(appointment.status) ? (
                    <div className="advisor-booking-card__actions">
                      <button
                        type="button"
                        className="advisor-appointment-card__action advisor-appointment-card__action--primary"
                        disabled={Boolean(actionLoadingId)}
                        onClick={() => openRescheduleModal(appointment)}
                      >
                        <CalendarRange size={16} />
                        Reschedule
                      </button>
                      <button
                        type="button"
                        className="advisor-appointment-card__action advisor-appointment-card__action--ghost"
                        disabled={Boolean(actionLoadingId)}
                        onClick={() => handleCancelAppointment(appointment)}
                      >
                        <CircleOff size={16} />
                        {actionLoadingId === `cancel:${appointment.id}` ? 'Cancelling...' : 'Cancel'}
                      </button>
                    </div>
                  ) : (
                    <div className="advisor-booking-card__footnote">
                      This session is already {appointment.status.toLowerCase()}.
                    </div>
                  )}
                </MagicBentoCard>
              ))}
            </MagicBentoGrid>
          ) : (
            <div className="advisor-bookings-panel__state">
              <p>You have not booked an advisor consultation yet.</p>
            </div>
          )}
        </section>
      )}

      <section className="advisor-section-head">
        <div>
          <span className="advisor-section-head__eyebrow">
            <ShieldCheck size={16} />
            Advisor Directory
          </span>
          <h2>Choose a professional who fits your style and next question.</h2>
        </div>
      </section>

      {advisors.length > 0 ? (
        <MagicBentoGrid
          className="advisor-hub-grid"
          pattern="uniform"
          glowColor="99, 102, 241"
          spotlightRadius={300}
        >
          {advisors.map((advisor) => (
            <MagicBentoCard
              key={advisor.id}
              className="advisor-card"
              clickEffect
              glowColor="99, 102, 241"
              particleCount={8}
            >
              <div className="advisor-card__top">
                <div className="advisor-card__header">
                  <div className="advisor-avatar">{getInitials(advisor.name)}</div>
                  <div className="advisor-card__identity">
                    <span className="advisor-card__eyebrow">
                      <BadgeCheck size={15} />
                      Verified Advisor
                    </span>
                    <h3>{advisor.name}</h3>
                    <span className="advisor-card__pill">{advisor.specialization || 'General advisory'}</span>
                  </div>
                </div>
                <div className="advisor-card__rating">
                  <Star size={16} fill="currentColor" />
                  <strong>{Number(advisor.averageRating || 0).toFixed(1)}</strong>
                </div>
              </div>

              <p className="advisor-card__bio">
                {advisor.bio || 'Practical portfolio guidance, planning support, and tailored market insights.'}
              </p>

              <div className="advisor-card__metrics">
                <div className="advisor-card__metric">
                  <span>Reviews</span>
                  <strong>{advisor.totalReviews || 0}</strong>
                </div>
                <div className="advisor-card__metric">
                  <span>Experience</span>
                  <strong>{advisor.experienceYears || 0}+ yrs</strong>
                </div>
                <div className="advisor-card__metric">
                  <span>Session fee</span>
                  <strong>{formatCurrency(advisor.consultationFee)}</strong>
                </div>
                <div className="advisor-card__metric advisor-card__metric--focus">
                  <span>Focus area</span>
                  <strong>{advisor.specialization || 'Advisory'}</strong>
                </div>
              </div>

              <div className="advisor-card__actions">
                <Link
                  to={`/advisors/${advisor.id}`}
                  className="advisor-card__action advisor-card__action--secondary advisor-card__action--full"
                >
                  <Wallet size={16} />
                  Hire Advisor
                </Link>
              </div>
            </MagicBentoCard>
          ))}
        </MagicBentoGrid>
      ) : (
        <MagicBentoCard className="advisor-empty" clickEffect={false}>
          <div>
            <span className="advisor-section-head__eyebrow">
              <BriefcaseBusiness size={16} />
              No advisors yet
            </span>
            <h2 style={{ marginTop: '0.7rem' }}>The directory is empty right now.</h2>
            <p>
              Advisors will appear here as soon as profiles are published. Check back later to
              compare experts and book a consultation.
            </p>
          </div>
        </MagicBentoCard>
      )}

      {rescheduleModal ? (
        <div className="portfolio-modal-overlay advisor-booking-modal-overlay" onClick={() => setRescheduleModal(null)}>
          <div className="portfolio-modal advisor-booking-modal advisor-booking-modal--compact" onClick={(event) => event.stopPropagation()}>
            <div className="advisor-booking-modal__scroll">
              <div className="portfolio-modal__header">
                <div className="portfolio-modal__title-block">
                  <span className="portfolio-card__eyebrow">
                    <CalendarRange size={15} />
                    Reschedule booking
                  </span>
                  <h3>{rescheduleModal.advisorName}</h3>
                  <p>Choose a new published slot or enter a preferred time for this consultation.</p>
                </div>
                <button className="portfolio-modal__close" onClick={() => setRescheduleModal(null)}>
                  Close
                </button>
              </div>

              <label className="portfolio-modal__field advisor-booking-modal__field" htmlFor="reschedule-slot">
                <span>Available slot</span>
                <select
                  id="reschedule-slot"
                  value={String(rescheduleTime).startsWith('slot:') ? rescheduleTime : ''}
                  onChange={(event) => setRescheduleTime(event.target.value)}
                >
                  <option value="">Choose an open slot</option>
                  {rescheduleSlots.map((slot) => (
                    <option key={slot.id} value={`slot:${slot.id}`}>
                      {formatDateTime(slot.startTime)} to {formatDateTime(slot.endTime)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="portfolio-modal__field advisor-booking-modal__field" htmlFor="reschedule-manual-time">
                <span>Preferred time</span>
                <input
                  id="reschedule-manual-time"
                  type="datetime-local"
                  value={String(rescheduleTime).startsWith('slot:') ? '' : rescheduleTime}
                  onChange={(event) => setRescheduleTime(event.target.value)}
                />
              </label>

              <label className="portfolio-modal__field advisor-booking-modal__field" htmlFor="reschedule-notes">
                <span>Notes</span>
                <textarea
                  id="reschedule-notes"
                  rows="4"
                  value={rescheduleNotes}
                  onChange={(event) => setRescheduleNotes(event.target.value)}
                  placeholder="Anything new the advisor should know for the rescheduled session?"
                />
              </label>

              <div className="portfolio-modal__actions">
                <button
                  type="button"
                  className="btn btn-primary advisor-detail-card__cta"
                  disabled={rescheduleLoading}
                  onClick={handleReschedule}
                >
                  <CalendarRange size={16} />
                  {rescheduleLoading ? 'Updating...' : 'Confirm new time'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setRescheduleModal(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
