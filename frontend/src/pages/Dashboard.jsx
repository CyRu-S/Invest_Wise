import { useEffect, useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Brain,
  Briefcase,
  CalendarClock,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  Users,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MagicBentoCard, MagicBentoGrid } from '../components/MagicBentoGrid';
import './DashboardPage.css';
import api from '../services/api';

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '₹2,50,000';
  return `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function formatPercent(value) {
  if (value === null || value === undefined || value === '') return 'N/A';
  return `${(Number(value) * 100).toFixed(2)}%`;
}

function RiskRing({ score, size = 70, strokeWidth = 5 }) {
  const gradientId = useId();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, Number(score || 0)));
  const progress = (clampedScore / 100) * circumference;

  return (
    <svg width={size} height={size} className="dashboard-risk-ring" aria-label={`Risk score ${clampedScore}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(99, 102, 241, 0.12)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
      />
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="0.35em"
        fill="#f8fafc"
        fontSize="0.85rem"
        fontWeight="700"
      >
        {clampedScore}
      </text>
    </svg>
  );
}

function DashboardActionCard({ to, icon, title, description, eyebrow, span = '', disabled = false }) {
  const content = (
    <>
      <div className="dashboard-bento__header">
        <span className="dashboard-bento__eyebrow">{eyebrow}</span>
        {!disabled && (
          <span className="dashboard-bento__arrow" aria-hidden="true">
            <ArrowRight size={16} />
          </span>
        )}
      </div>
      <div className="dashboard-bento__icon">{icon}</div>
      <div className="dashboard-bento__body">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </>
  );

  if (disabled) {
    return (
      <MagicBentoCard className={`dashboard-bento dashboard-bento--muted ${span}`.trim()}>
        {content}
      </MagicBentoCard>
    );
  }

  return (
    <MagicBentoCard as={Link} to={to} className={`dashboard-bento dashboard-bento--action ${span}`.trim()}>
      {content}
    </MagicBentoCard>
  );
}

function DashboardMetricTile({ label, value, tone = 'indigo' }) {
  return (
    <div className={`dashboard-metric-tile dashboard-metric-tile--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DashboardHeader({ user, roleLabel, subtitle, summaryItems }) {
  return (
    <section className="dashboard-hero">
      <div className="dashboard-hero__copy">
        <span className="dashboard-hero__kicker">
          <Sparkles size={16} />
          {roleLabel}
        </span>
        <h1>{user?.fullName ? `Welcome back, ${user.fullName}` : 'Welcome back'}</h1>
        <p>{subtitle}</p>
        <div className="dashboard-hero__chips">
          <span className="dashboard-hero__chip">Unified investment workspace</span>
          <span className="dashboard-hero__chip">Live platform snapshot</span>
        </div>
      </div>

      <div className="dashboard-hero__summary">
        {summaryItems.map((item) => (
          <div key={item.label} className={`dashboard-hero__stat dashboard-hero__stat--${item.tone || 'indigo'}`}>
            <span className="dashboard-hero__stat-label">{item.label}</span>
            <strong>{item.value}</strong>
            {item.note ? <span className="dashboard-hero__stat-note">{item.note}</span> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function InvestorDashboard({ user, profile, funds, topPerformer, categoryCount }) {
  const walletBalance = formatCurrency(profile?.walletBalance);
  const riskScore = Number(profile?.riskToleranceScore || 0);
  const riskCategory = profile?.riskCategory || 'Not set';
  const topReturn = topPerformer ? formatPercent(topPerformer.oneYearReturn) : 'N/A';

  return (
    <>
      <DashboardHeader
        user={user}
        roleLabel="Investor Dashboard"
        subtitle="Monitor capital, understand your risk posture, and move from research to execution without leaving the page."
        summaryItems={[
          { label: 'Wallet balance', value: walletBalance },
          { label: 'Risk score', value: `${riskScore}/100`, note: riskCategory },
          { label: 'Funds available', value: funds.length, note: `${categoryCount} categories` },
          { label: 'Top 1Y performer', value: topPerformer?.tickerSymbol || 'Waiting', note: topReturn },
        ]}
      />

      <MagicBentoGrid className="dashboard-bento-grid dashboard-bento-grid--investor" pattern="uniform">
        <DashboardActionCard
          to="/risk-profiler"
          icon={<Brain size={26} />}
          title="Refresh your risk profile"
          description="Re-run the profiler whenever your timeline or comfort with volatility changes."
          eyebrow="Behavior"
        />

        <DashboardActionCard
          to="/funds"
          icon={<TrendingUp size={26} />}
          title="Scan the fund universe"
          description="Browse live funds by category, cost, and risk fit using the redesigned explorer."
          eyebrow="Research"
        />

        <DashboardActionCard
          to="/portfolio"
          icon={<Briefcase size={26} />}
          title="Track portfolio decisions"
          description="Follow allocation, returns, and transaction activity in one focused workspace."
          eyebrow="Execution"
        />

        <MagicBentoCard className="dashboard-bento dashboard-bento--primary dashboard-bento--full-row">
          <div className="dashboard-bento__header">
            <span className="dashboard-bento__eyebrow">Portfolio cockpit</span>
            <span className="dashboard-bento__badge">Investor</span>
          </div>
          <div className="dashboard-bento__body">
            <h2>Move from self-discovery to allocation with less friction.</h2>
            <p>
              Your dashboard now ties together risk, opportunity, and action. Start with your
              profile, explore fitting funds, then track every move in your portfolio view.
            </p>
          </div>
          <div className="dashboard-bento__metrics">
            <DashboardMetricTile label="Wallet" value={walletBalance} tone="indigo" />
            <DashboardMetricTile label="Risk category" value={riskCategory} tone="violet" />
            <DashboardMetricTile label="Fund universe" value={`${funds.length} live funds`} tone="emerald" />
            <DashboardMetricTile label="Strongest trend" value={topPerformer?.fundName || 'No data yet'} tone="amber" />
          </div>
        </MagicBentoCard>
      </MagicBentoGrid>
    </>
  );
}

function AdvisorDashboard({ user, funds, topPerformer, categoryCount }) {
  return (
    <>
      <DashboardHeader
        user={user}
        roleLabel="Advisor Dashboard"
        subtitle="Stay close to the live fund universe, guide investors with confidence, and keep an eye on where momentum is building."
        summaryItems={[
          { label: 'Role', value: 'Financial advisor', tone: 'indigo' },
          { label: 'Tracked funds', value: funds.length, tone: 'violet', note: `${categoryCount} categories` },
          { label: 'Top momentum', value: topPerformer?.tickerSymbol || 'Waiting', tone: 'emerald' },
          { label: 'Client tools', value: 'Research ready', tone: 'amber' },
        ]}
      />

      <MagicBentoGrid className="dashboard-bento-grid dashboard-bento-grid--advisor" pattern="uniform">
        <DashboardActionCard
          to="/funds"
          icon={<BarChart3 size={26} />}
          title="Review fund analytics"
          description="Open any fund and walk through performance, risk, and NAV history with clients."
          eyebrow="Analytics"
        />

        <DashboardActionCard
          to="/appointments"
          icon={<CalendarClock size={26} />}
          title="Track advisor meetings"
          description="See investor bookings, upcoming sessions, and consultation notes in one dedicated advisor queue."
          eyebrow="Pipeline"
        />

        <MagicBentoCard className="dashboard-bento dashboard-bento--primary dashboard-bento--full-row">
          <div className="dashboard-bento__header">
            <span className="dashboard-bento__eyebrow">Advisory workspace</span>
            <span className="dashboard-bento__badge">Advisor</span>
          </div>
          <div className="dashboard-bento__body">
            <h2>Guide conversations with cleaner fund context and faster access.</h2>
            <p>
              Use the explorer and detail views as your live briefing deck. Risk, performance,
              and NAV trends are already arranged so client discussions stay focused.
            </p>
          </div>
          <div className="dashboard-bento__metrics">
            <DashboardMetricTile label="Tracked funds" value={funds.length} tone="indigo" />
            <DashboardMetricTile label="Categories" value={categoryCount} tone="violet" />
            <DashboardMetricTile label="Best momentum" value={topPerformer?.tickerSymbol || 'N/A'} tone="emerald" />
            <DashboardMetricTile label="Workflow" value="Research first" tone="amber" />
          </div>
          <div className="dashboard-bento__cta-row">
            <Link to="/funds" className="dashboard-inline-link">Open fund explorer</Link>
            <Link to="/appointments" className="dashboard-inline-link">Open appointments</Link>
          </div>
        </MagicBentoCard>
      </MagicBentoGrid>
    </>
  );
}

function AnalystDashboard({ user, funds, topPerformer, categoryCount }) {
  return (
    <>
      <DashboardHeader
        user={user}
        roleLabel="Analyst Dashboard"
        subtitle="Stay anchored in the live dataset, inspect performance signals quickly, and move into deeper fund analysis with one click."
        summaryItems={[
          { label: 'Total funds', value: funds.length, tone: 'indigo' },
          { label: 'Categories tracked', value: categoryCount, tone: 'violet' },
          { label: 'Top performer', value: topPerformer?.tickerSymbol || 'Waiting', tone: 'emerald' },
          { label: 'Research mode', value: 'Active', tone: 'amber' },
        ]}
      />

      <MagicBentoGrid className="dashboard-bento-grid dashboard-bento-grid--analyst" pattern="uniform">
        <DashboardActionCard
          to="/funds"
          icon={<TrendingUp size={26} />}
          title="Inspect live fund trends"
          description="Jump into fund detail pages for cleaner NAV charting and risk-adjusted metrics."
          eyebrow="Research"
        />

        <DashboardActionCard
          to="/data-management"
          icon={<Upload size={26} />}
          title="Data management"
          description="Create, update, and bulk-import fund metadata from one analyst-ready operations surface."
          eyebrow="Pipeline"
        />

        <MagicBentoCard className="dashboard-bento dashboard-bento--primary dashboard-bento--full-row">
          <div className="dashboard-bento__header">
            <span className="dashboard-bento__eyebrow">Research workspace</span>
            <span className="dashboard-bento__badge">Analyst</span>
          </div>
          <div className="dashboard-bento__body">
            <h2>Keep analysis and dataset stewardship in the same operating loop.</h2>
            <p>
              Review the live fund universe, maintain core metadata, and push coverage updates
              without breaking out into improvised admin screens.
            </p>
          </div>
          <div className="dashboard-bento__metrics">
            <DashboardMetricTile label="Universe" value={`${funds.length} funds`} tone="indigo" />
            <DashboardMetricTile label="Categories" value={`${categoryCount} tracked`} tone="violet" />
            <DashboardMetricTile label="Momentum lead" value={topPerformer?.tickerSymbol || 'N/A'} tone="emerald" />
            <DashboardMetricTile label="Data state" value="Pipeline active" tone="amber" />
          </div>
          <div className="dashboard-bento__cta-row">
            <Link to="/funds" className="dashboard-inline-link">Open analytics surface</Link>
            <Link to="/data-management" className="dashboard-inline-link">Open data management</Link>
          </div>
        </MagicBentoCard>
      </MagicBentoGrid>
    </>
  );
}

function AdminDashboard({ user, stats, funds, categoryCount }) {
  return (
    <>
      <DashboardHeader
        user={user}
        roleLabel="Admin Dashboard"
        subtitle="Keep platform activity, user distribution, and operational actions visible in one polished control surface."
        summaryItems={[
          { label: 'Total users', value: stats.totalUsers, tone: 'indigo' },
          { label: 'Investors', value: stats.investors, tone: 'violet' },
          { label: 'Advisors', value: stats.advisors, tone: 'emerald' },
          { label: 'Analysts', value: stats.analysts, tone: 'amber' },
        ]}
      />

      <MagicBentoGrid className="dashboard-bento-grid dashboard-bento-grid--admin" pattern="uniform">
        <DashboardActionCard
          to="/admin"
          icon={<Users size={26} />}
          title="Manage users and roles"
          description="Review account access, adjust privileges, and keep platform permissions tidy."
          eyebrow="Access"
        />

        <DashboardActionCard
          to="/funds"
          icon={<Briefcase size={26} />}
          title="Review fund inventory"
          description="Move straight into the fund workspace to inspect data quality and public-facing analytics."
          eyebrow="Inventory"
        />

        <DashboardActionCard
          to="/data-management"
          icon={<Upload size={26} />}
          title="Data management"
          description="Create, update, and bulk-import fund metadata from the same admin operating surface."
          eyebrow="Pipeline"
        />

        <MagicBentoCard className="dashboard-bento dashboard-bento--primary dashboard-bento--full-row">
          <div className="dashboard-bento__header">
            <span className="dashboard-bento__eyebrow">Admin workspace</span>
            <span className="dashboard-bento__badge">Admin</span>
          </div>
          <div className="dashboard-bento__body">
            <h2>Keep access control and fund oversight in the same operating loop.</h2>
            <p>
              The live role mix is already visible in the hero. From here, move into account
              governance or fund supervision without bouncing between disconnected admin surfaces.
            </p>
          </div>
          <div className="dashboard-bento__metrics">
            <DashboardMetricTile label="Users" value={stats.totalUsers} tone="indigo" />
            <DashboardMetricTile label="Funds" value={`${funds.length} tracked`} tone="violet" />
            <DashboardMetricTile label="Categories" value={`${categoryCount} active`} tone="emerald" />
            <DashboardMetricTile label="Admin state" value="Operational" tone="amber" />
          </div>
          <div className="dashboard-bento__cta-row">
            <Link to="/admin" className="dashboard-inline-link">Open user management</Link>
            <Link to="/funds" className="dashboard-inline-link">Open fund inventory</Link>
          </div>
        </MagicBentoCard>
      </MagicBentoGrid>
    </>
  );
}

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const [profile, setProfile] = useState(null);
  const [funds, setFunds] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/funds/public').then((response) => setFunds(response.data)).catch(() => {});

    if (hasRole('INVESTOR')) {
      api.get('/investor/profile').then((response) => setProfile(response.data)).catch(() => {});
    }

    if (hasRole('ADMIN')) {
      api.get('/admin/stats').then((response) => setStats(response.data)).catch(() => {});
    }

  }, [hasRole]);

  const currentRole = useMemo(() => {
    if (hasRole('ADMIN')) return 'ADMIN';
    if (hasRole('INVESTOR')) return 'INVESTOR';
    if (hasRole('ADVISOR')) return 'ADVISOR';
    if (hasRole('ANALYST')) return 'ANALYST';
    return user?.role || 'USER';
  }, [hasRole, user?.role]);

  const categoryCount = new Set(funds.map((fund) => fund.category).filter(Boolean)).size;
  const topPerformer = funds.reduce((best, fund) => {
    if (!best) return fund;
    return Number(fund.oneYearReturn || 0) > Number(best.oneYearReturn || 0) ? fund : best;
  }, null);

  return (
    <div className="page-container dashboard-shell" id="dashboard-page">
      {currentRole === 'INVESTOR' && (
        <InvestorDashboard
          user={user}
          profile={profile}
          funds={funds}
          topPerformer={topPerformer}
          categoryCount={categoryCount}
        />
      )}

      {currentRole === 'ADVISOR' && (
        <AdvisorDashboard
          user={user}
          funds={funds}
          topPerformer={topPerformer}
          categoryCount={categoryCount}
        />
      )}

      {currentRole === 'ANALYST' && (
        <AnalystDashboard
          user={user}
          funds={funds}
          topPerformer={topPerformer}
          categoryCount={categoryCount}
        />
      )}

      {currentRole === 'ADMIN' && stats && (
        <AdminDashboard
          user={user}
          stats={stats}
          funds={funds}
          categoryCount={categoryCount}
        />
      )}
    </div>
  );
}
