import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  CalendarDays,
  CalendarPlus2,
  CheckCheck,
  Clock3,
  CircleOff,
  Trash2,
  FileText,
  Mail,
  Sparkles,
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

function getStatusTimestampLabel(appointment) {
  const updatedAt = appointment.updatedAt || appointment.createdAt;

  if (appointment.status === 'COMPLETED') {
    return `Completed on ${formatDateTime(updatedAt)}`;
  }

  if (appointment.status === 'CANCELLED') {
    return `Cancelled on ${formatDateTime(updatedAt)}`;
  }

  if (appointment.status === 'CONFIRMED') {
    return `Confirmed on ${formatDateTime(updatedAt)}`;
  }

  return `Booked on ${formatDateTime(appointment.createdAt)}`;
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

const FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

function getAppointmentActions(status) {
  if (status === 'PENDING') {
    return [
      { label: 'Confirm', status: 'CONFIRMED', icon: CheckCheck, tone: 'primary' },
      { label: 'Cancel', status: 'CANCELLED', icon: CircleOff, tone: 'ghost' },
    ];
  }

  if (status === 'CONFIRMED') {
    return [
      { label: 'Complete', status: 'COMPLETED', icon: CheckCheck, tone: 'primary' },
      { label: 'Cancel', status: 'CANCELLED', icon: CircleOff, tone: 'ghost' },
    ];
  }

  return [];
}

export default function AdvisorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [availabilityLoadingId, setAvailabilityLoadingId] = useState('');
  const [availabilityForm, setAvailabilityForm] = useState({
    startTime: '',
    endTime: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    Promise.all([
      api.get('/advisors/advisor-appointments'),
      api.get('/advisors/advisor-availability'),
    ])
      .then(([appointmentsResponse, availabilityResponse]) => {
        setAppointments(appointmentsResponse.data);
        setAvailabilitySlots(availabilityResponse.data);
      })
      .catch((err) => {
        console.error(err);
        setError('Unable to load advisor appointments right now.');
      })
      .finally(() => setLoading(false));
  }, []);

  const appointmentSummary = useMemo(() => {
    const now = Date.now();
    const upcoming = appointments.filter((appointment) => {
      const scheduledTime = new Date(appointment.scheduledAt).getTime();
      return (
        !Number.isNaN(scheduledTime) &&
        scheduledTime >= now &&
        !['CANCELLED', 'COMPLETED'].includes(appointment.status)
      );
    });

    const pending = appointments.filter((appointment) => appointment.status === 'PENDING');
    const completed = appointments.filter((appointment) => appointment.status === 'COMPLETED');
    const totalValue = appointments.reduce(
      (sum, appointment) => sum + Number(appointment.consultationFee || 0),
      0
    );

    const nextSession = [...upcoming].sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    )[0];

    return {
      total: appointments.length,
      upcoming: upcoming.length,
      pending: pending.length,
      completed: completed.length,
      totalValue,
      nextSession,
    };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    if (filter === 'ALL') return appointments;
    return appointments.filter((appointment) => appointment.status === filter);
  }, [appointments, filter]);

  const availabilitySummary = useMemo(() => {
    const openSlots = availabilitySlots.filter((slot) => !slot.booked);
    const bookedSlots = availabilitySlots.filter((slot) => slot.booked);
    const nextOpenSlot = [...openSlots].sort(
      (left, right) => new Date(left.startTime).getTime() - new Date(right.startTime).getTime()
    )[0];

    return {
      total: availabilitySlots.length,
      open: openSlots.length,
      booked: bookedSlots.length,
      nextOpenSlot,
    };
  }, [availabilitySlots]);

  const handleAppointmentAction = async (appointmentId, status) => {
    setActionLoadingId(`${appointmentId}:${status}`);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.patch(`/advisors/advisor-appointments/${appointmentId}/status`, {
        status,
      });

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === appointmentId ? response.data : appointment
        )
      );

      setMessage({
        type: 'success',
        text: `Appointment marked as ${status.toLowerCase()}.`,
      });
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Unable to update this appointment right now.',
      });
    } finally {
      setActionLoadingId('');
    }
  };

  const handleAvailabilitySubmit = async () => {
    if (!availabilityForm.startTime || !availabilityForm.endTime) {
      setMessage({ type: 'error', text: 'Choose both the slot start and end time.' });
      return;
    }

    setAvailabilityLoadingId('create');
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('/advisors/advisor-availability', availabilityForm);
      setAvailabilitySlots((currentSlots) =>
        [...currentSlots, response.data].sort(
          (left, right) => new Date(left.startTime).getTime() - new Date(right.startTime).getTime()
        )
      );
      setAvailabilityForm({ startTime: '', endTime: '' });
      setMessage({ type: 'success', text: 'Availability slot published successfully.' });
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Unable to publish this slot right now.',
      });
    } finally {
      setAvailabilityLoadingId('');
    }
  };

  const handleDeleteAvailability = async (slotId) => {
    setAvailabilityLoadingId(`delete:${slotId}`);
    setMessage({ type: '', text: '' });

    try {
      await api.delete(`/advisors/advisor-availability/${slotId}`);
      setAvailabilitySlots((currentSlots) => currentSlots.filter((slot) => slot.id !== slotId));
      setMessage({ type: 'success', text: 'Availability slot removed successfully.' });
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Unable to delete this slot right now.',
      });
    } finally {
      setAvailabilityLoadingId('');
    }
  };

  if (loading) {
    return (
      <div className="page-container insight-page advisor-appointments-page">
        <div className="insight-loading-shell">
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container insight-page advisor-appointments-page" id="advisor-appointments-page">
      {message.text ? (
        <div className={`advisor-appointments-feedback advisor-appointments-feedback--${message.type}`}>
          {message.text}
        </div>
      ) : null}

      <section className="insight-hero advisor-appointments-hero">
        <div className="insight-hero__copy">
          <span className="insight-hero__kicker">
            <Sparkles size={16} />
            Advisor Appointments
          </span>
          <h1>See every investor consultation the moment it lands in your queue.</h1>
          <p>
            Bookings created from the investor side now surface here, so you can review the
            investor, scheduled time, notes, and consultation value from one focused workspace.
          </p>
          <div className="insight-hero__chips">
            <span className="insight-chip">Advisor-only schedule</span>
            <span className="insight-chip">Live booking visibility</span>
          </div>
        </div>

        <div className="insight-hero__summary advisor-appointments-summary">
          <div className="insight-hero__stat insight-hero__stat--indigo">
            <span>Total bookings</span>
            <strong>{appointmentSummary.total}</strong>
          </div>
          <div className="insight-hero__stat insight-hero__stat--violet">
            <span>Upcoming</span>
            <strong>{appointmentSummary.upcoming}</strong>
          </div>
          <div className="insight-hero__stat insight-hero__stat--amber">
            <span>Pending review</span>
            <strong>{appointmentSummary.pending}</strong>
          </div>
          <div className="insight-hero__stat insight-hero__stat--emerald">
            <span>Consultation value</span>
            <strong>{formatCurrency(appointmentSummary.totalValue)}</strong>
          </div>
        </div>
      </section>

      <section className="advisor-appointments-overview">
        <MagicBentoCard className="advisor-appointments-spotlight" clickEffect={false}>
          <div className="advisor-appointments-spotlight__top">
            <span className="advisor-section-head__eyebrow">
              <CalendarDays size={16} />
              Next in line
            </span>
            <span className="advisor-appointments-spotlight__badge">
              {appointmentSummary.nextSession ? appointmentSummary.nextSession.status : 'No sessions yet'}
            </span>
          </div>

          {appointmentSummary.nextSession ? (
            <>
              <h2>{appointmentSummary.nextSession.investorName}</h2>
              <p>
                {appointmentSummary.nextSession.specialization || 'General advisory'} session on{' '}
                {formatDateTime(appointmentSummary.nextSession.scheduledAt)}.
              </p>
              <div className="advisor-appointments-spotlight__details">
                <div>
                  <span>
                    <Mail size={15} />
                    Contact
                  </span>
                  <strong>{appointmentSummary.nextSession.investorEmail}</strong>
                </div>
                <div>
                  <span>
                    <Wallet size={15} />
                    Session fee
                  </span>
                  <strong>{formatCurrency(appointmentSummary.nextSession.consultationFee)}</strong>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2>No scheduled investor session yet.</h2>
              <p>
                As soon as an investor books time with you from the advisor directory, the session
                will appear here automatically.
              </p>
            </>
          )}
        </MagicBentoCard>

        <MagicBentoCard className="advisor-appointments-note" clickEffect={false}>
          <div className="advisor-appointments-note__header">
            <span className="advisor-appointments-note__eyebrow">Workflow note</span>
          </div>
          <div className="advisor-appointments-note__body">
            <h3>Bookings are now visible on the advisor side.</h3>
            <p>
              Investor appointment requests created from profile pages now flow into this schedule
              view, so you no longer have to rely on placeholder pipeline cards.
            </p>
          </div>
          <div className="advisor-appointments-note__actions">
            <Link to="/dashboard" className="advisor-appointments-note__link">Back to advisor dashboard</Link>
            <Link to="/funds" className="advisor-appointments-note__link">Open fund workspace</Link>
          </div>
        </MagicBentoCard>
      </section>

      <section className="advisor-appointments-section-head advisor-appointments-section-head--availability">
        <div>
          <span className="advisor-section-head__eyebrow">
            <CalendarPlus2 size={16} />
            Availability Manager
          </span>
          <h2>Publish the consultation windows investors can book.</h2>
        </div>
      </section>

      <section className="advisor-availability-layout">
        <MagicBentoCard className="advisor-availability-card" clickEffect={false}>
          <div className="advisor-availability-card__header">
            <div>
              <span className="advisor-section-head__eyebrow">
                <CalendarPlus2 size={16} />
                Create slot
              </span>
              <h3>Add a new open session window.</h3>
            </div>
            <span className="advisor-appointments-spotlight__badge">
              {availabilitySummary.open} open
            </span>
          </div>

          <div className="advisor-availability-form">
            <label className="advisor-detail-modal__field" htmlFor="availability-start">
              <span>Start time</span>
              <input
                id="availability-start"
                type="datetime-local"
                value={availabilityForm.startTime}
                onChange={(event) =>
                  setAvailabilityForm((currentForm) => ({
                    ...currentForm,
                    startTime: event.target.value,
                  }))
                }
              />
            </label>

            <label className="advisor-detail-modal__field" htmlFor="availability-end">
              <span>End time</span>
              <input
                id="availability-end"
                type="datetime-local"
                value={availabilityForm.endTime}
                onChange={(event) =>
                  setAvailabilityForm((currentForm) => ({
                    ...currentForm,
                    endTime: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <div className="advisor-availability-card__summary">
            <div>
              <span>Total slots</span>
              <strong>{availabilitySummary.total}</strong>
            </div>
            <div>
              <span>Booked slots</span>
              <strong>{availabilitySummary.booked}</strong>
            </div>
            <div>
              <span>Next open slot</span>
              <strong>
                {availabilitySummary.nextOpenSlot
                  ? formatDateTime(availabilitySummary.nextOpenSlot.startTime)
                  : 'No open slot'}
              </strong>
            </div>
          </div>

          <div className="advisor-availability-card__actions">
            <button
              type="button"
              className="advisor-appointment-card__action advisor-appointment-card__action--primary"
              disabled={availabilityLoadingId === 'create'}
              onClick={handleAvailabilitySubmit}
            >
              <CalendarPlus2 size={16} />
              {availabilityLoadingId === 'create' ? 'Publishing...' : 'Publish slot'}
            </button>
          </div>
        </MagicBentoCard>

        <MagicBentoCard className="advisor-availability-card advisor-availability-card--list" clickEffect={false}>
          <div className="advisor-availability-card__header">
            <div>
              <span className="advisor-section-head__eyebrow">
                <CalendarDays size={16} />
                Live availability
              </span>
              <h3>Review all published and booked slots.</h3>
            </div>
          </div>

          {availabilitySlots.length ? (
            <div className="advisor-availability-list">
              {availabilitySlots
                .slice()
                .sort((left, right) => new Date(left.startTime).getTime() - new Date(right.startTime).getTime())
                .map((slot) => (
                  <div key={slot.id} className="advisor-availability-list__item">
                    <div>
                      <span>{slot.booked ? 'Booked slot' : 'Open slot'}</span>
                      <strong>{formatDateTime(slot.startTime)}</strong>
                      <small>Ends {formatDateTime(slot.endTime)}</small>
                    </div>
                    {slot.booked ? (
                      <span className="advisor-booking-card__status advisor-booking-card__status--confirmed">
                        Booked
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="advisor-appointment-card__action advisor-appointment-card__action--ghost"
                        disabled={Boolean(availabilityLoadingId)}
                        onClick={() => handleDeleteAvailability(slot.id)}
                      >
                        <Trash2 size={15} />
                        {availabilityLoadingId === `delete:${slot.id}` ? 'Removing...' : 'Delete'}
                      </button>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="advisor-bookings-panel__state advisor-bookings-panel__state--compact">
              <p>No availability slots published yet.</p>
            </div>
          )}
        </MagicBentoCard>
      </section>

      <section className="advisor-appointments-section-head">
        <div>
          <span className="advisor-section-head__eyebrow">
            <BadgeCheck size={16} />
            Booking Queue
          </span>
          <h2>Review investor meetings by status.</h2>
        </div>

        <div className="advisor-appointments-filters">
          {FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              className={`advisor-appointments-filter ${filter === status ? 'is-active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <div className="advisor-bookings-panel__state">
          <p>{error}</p>
        </div>
      ) : filteredAppointments.length ? (
        <MagicBentoGrid
          className="advisor-appointments-grid"
          pattern="uniform"
          glowColor="99, 102, 241"
          spotlightRadius={280}
        >
          {filteredAppointments.map((appointment) => (
            <MagicBentoCard
              key={appointment.id}
              className="advisor-appointment-card"
              particleCount={8}
            >
              <div className="advisor-appointment-card__top">
                <div className="advisor-appointment-card__identity">
                  <div className="advisor-avatar">{getInitials(appointment.investorName)}</div>
                  <div>
                    <span className="advisor-card__eyebrow">
                      <BadgeCheck size={15} />
                      {appointment.specialization || 'Advisor session'}
                    </span>
                    <h3>{appointment.investorName}</h3>
                    <p>{appointment.investorEmail}</p>
                  </div>
                </div>

                <span className={`advisor-booking-card__status advisor-booking-card__status--${appointment.status?.toLowerCase()}`}>
                  {appointment.status}
                </span>
              </div>

              <div className="advisor-appointment-card__meta">
                <div>
                  <span>
                    <Clock3 size={15} />
                    Scheduled
                  </span>
                  <strong>{formatDateTime(appointment.scheduledAt)}</strong>
                </div>
                <div>
                  <span>
                    <Wallet size={15} />
                    Session fee
                  </span>
                  <strong>{formatCurrency(appointment.consultationFee)}</strong>
                </div>
                <div className="advisor-appointment-card__meta--notes">
                  <span>
                    <FileText size={15} />
                    Notes
                  </span>
                  <strong>{appointment.notes || 'No notes were added for this session.'}</strong>
                </div>
              </div>

              {getAppointmentActions(appointment.status).length ? (
                <div className="advisor-appointment-card__actions">
                  {getAppointmentActions(appointment.status).map((action) => {
                    const Icon = action.icon;
                    const isLoading = actionLoadingId === `${appointment.id}:${action.status}`;

                    return (
                      <button
                        key={action.status}
                        type="button"
                        className={`advisor-appointment-card__action advisor-appointment-card__action--${action.tone}`}
                        disabled={Boolean(actionLoadingId)}
                        onClick={() => handleAppointmentAction(appointment.id, action.status)}
                      >
                        <Icon size={16} />
                        {isLoading ? 'Updating...' : action.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="advisor-appointment-card__footnote">
                  This session is already {appointment.status.toLowerCase()}.
                </div>
              )}

              <div className="advisor-appointment-card__timestamp">
                {getStatusTimestampLabel(appointment)}
              </div>
            </MagicBentoCard>
          ))}
        </MagicBentoGrid>
      ) : (
        <MagicBentoCard className="advisor-empty" clickEffect={false}>
          <div>
            <span className="advisor-section-head__eyebrow">
              <CalendarDays size={16} />
              No meetings in this view
            </span>
            <h2 style={{ marginTop: '0.7rem' }}>Nothing matches the current filter.</h2>
            <p>
              Try another status, or wait for investors to book consultations from the advisor
              directory.
            </p>
          </div>
        </MagicBentoCard>
      )}
    </div>
  );
}
