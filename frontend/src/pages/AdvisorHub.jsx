import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileText,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
} from 'lucide-react';
import { MagicBentoCard, MagicBentoGrid } from '../components/MagicBentoGrid';
import api from '../services/api';
import './AdvisorRiskPages.css';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
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

  return new Intl.DateTimeFormat('en-US', {
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/advisors')
      .then((response) => setAdvisors(response.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const loadAppointments = async () => {
    setAppointmentsLoading(true);
    setAppointmentsError('');

    try {
      const response = await api.get('/advisors/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error(error);
      setAppointmentsError('Unable to load your bookings right now.');
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const handleToggleAppointments = async () => {
    const nextOpen = !appointmentsOpen;
    setAppointmentsOpen(nextOpen);

    if (nextOpen && !appointments.length && !appointmentsLoading && !appointmentsError) {
      await loadAppointments();
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
                  className="advisor-card__action advisor-card__action--primary"
                >
                  View Profile
                  <ArrowRight size={16} />
                </Link>
                <button
                  className="advisor-card__action advisor-card__action--secondary"
                  onClick={() =>
                    alert(
                      'Stripe payment would be triggered here. Configure your Stripe keys to enable this feature.'
                    )
                  }
                >
                  <Wallet size={16} />
                  Hire Advisor
                </button>
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
    </div>
  );
}
