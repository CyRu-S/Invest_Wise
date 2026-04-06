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
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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

function formatCompactCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

function formatChartCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function formatMonthKey(value) {
  return new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(value);
}

function normalizeTransaction(transaction) {
  const isAdvisorRefund =
    transaction.type === 'DEPOSIT' &&
    String(transaction.referenceId || '').startsWith('APPOINTMENT-') &&
    String(transaction.description || '').toLowerCase().includes('refund');
  const fallbackCashflow = isAdvisorRefund
    ? 'REFUND'
    : transaction.type === 'DEPOSIT' || transaction.type === 'SELL'
      ? 'INCOME'
      : 'EXPENSE';
  const cashflowType = transaction.cashflowType || fallbackCashflow;
  const fallbackBalanceDirection =
    transaction.type === 'BUY' || transaction.type === 'FEE_PAYMENT' ? 'DEBIT' : 'CREDIT';
  const balanceDirection = transaction.balanceDirection || fallbackBalanceDirection;
  const amount = Number(transaction.amount || 0);

  return {
    ...transaction,
    amount,
    cashflowType,
    balanceDirection,
    category: transaction.category || 'General',
    signedAmount: balanceDirection === 'CREDIT' ? amount : balanceDirection === 'DEBIT' ? -amount : 0,
    title: transaction.title || transaction.description || transaction.type,
  };
}

function buildBalanceTrend(transactions, walletBalance) {
  const currentWallet = Number(walletBalance || 0);
  const signedTotal = transactions.reduce((sum, tx) => sum + tx.signedAmount, 0);
  const startingWallet = Math.max(currentWallet - signedTotal, 0);
  const monthKeys = [];
  const now = new Date();

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    monthKeys.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }

  const monthlyBuckets = monthKeys.reduce((accumulator, key) => {
    accumulator[key] = { income: 0, expense: 0 };
    return accumulator;
  }, {});

  transactions.forEach((tx) => {
    const date = new Date(tx.createdAt);
    if (Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyBuckets[key]) return;

    if (tx.cashflowType === 'INCOME') {
      monthlyBuckets[key].income += tx.amount;
    } else {
      monthlyBuckets[key].expense += tx.amount;
    }
  });

  let runningBalance = startingWallet;
  return monthKeys.map((key) => {
    const [year, month] = key.split('-').map(Number);
    const snapshotDate = new Date(year, month - 1, 1);
    const income = monthlyBuckets[key].income;
    const expense = monthlyBuckets[key].expense;
    runningBalance += income - expense;

    return {
      month: formatMonthKey(snapshotDate),
      balance: Number(runningBalance.toFixed(2)),
      income,
      expense,
    };
  });
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

function InvestorDashboard({ user, profile, funds, holdings, transactions, topPerformer, categoryCount }) {
  const walletBalanceNumber = Number(profile?.walletBalance || 0);
  const walletBalance = formatCurrency(walletBalanceNumber);
  const riskScore = Number(profile?.riskToleranceScore || 0);
  const riskCategory = profile?.riskCategory || 'Not set';
  const normalizedTransactions = transactions.map(normalizeTransaction);
  const totalPortfolioValue = holdings.reduce((sum, holding) => sum + Number(holding.currentValue || 0), 0);
  const totalIncome = normalizedTransactions
    .filter((transaction) => transaction.cashflowType === 'INCOME')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalExpenses = normalizedTransactions
    .filter((transaction) => transaction.cashflowType === 'EXPENSE')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const balanceTrend = buildBalanceTrend(normalizedTransactions, walletBalanceNumber);
  const spendingBreakdown = Object.entries(
    normalizedTransactions
      .filter((transaction) => transaction.cashflowType === 'EXPENSE')
      .reduce((accumulator, transaction) => {
        accumulator[transaction.category] = (accumulator[transaction.category] || 0) + transaction.amount;
        return accumulator;
      }, {})
  )
    .map(([category, amount]) => ({ category, amount }))
    .sort((left, right) => right.amount - left.amount)
    .slice(0, 5);

  const highestSpending = spendingBreakdown[0];
  const latestMonth = balanceTrend[balanceTrend.length - 1];
  const previousMonth = balanceTrend[balanceTrend.length - 2];
  const monthDelta = latestMonth && previousMonth ? latestMonth.expense - previousMonth.expense : 0;
  const incomeCount = normalizedTransactions.filter((transaction) => transaction.cashflowType === 'INCOME').length;
  const expenseCount = normalizedTransactions.filter((transaction) => transaction.cashflowType === 'EXPENSE').length;
  const latestNet = latestMonth ? latestMonth.income - latestMonth.expense : 0;
  const insightItems = [
    highestSpending
      ? `Highest spending category: ${highestSpending.category} at ${formatCurrency(highestSpending.amount)}.`
      : 'No expense category has been logged yet.',
    latestMonth && previousMonth
      ? `Monthly comparison: expenses are ${monthDelta >= 0 ? 'up' : 'down'} ${formatCurrency(Math.abs(monthDelta))} versus ${previousMonth.month}.`
      : 'Monthly comparison will appear once at least two months of activity are available.',
    `Useful observation: ${latestNet >= 0 ? 'cash flow stayed positive' : 'spend exceeded inflow'} in ${latestMonth?.month || 'the current period'}, with ${incomeCount} income entries and ${expenseCount} expense entries logged.`,
  ];

  return (
    <>
      <DashboardHeader
        user={user}
        roleLabel="Investor Dashboard"
        subtitle="Monitor capital, understand your risk posture, and move from research to execution without leaving the page."
        summaryItems={[
          { label: 'Wallet balance', value: walletBalance },
          { label: 'Risk score', value: `${riskScore}/100`, note: riskCategory },
          { label: 'Income', value: formatCurrency(totalIncome), note: 'Deposits and redemptions' },
          { label: 'Expenses', value: formatCurrency(totalExpenses), note: 'Investments and advisor fees' },
        ]}
      />

      <MagicBentoGrid className="dashboard-finance-grid" pattern="uniform">
        <MagicBentoCard className="dashboard-bento dashboard-finance-card dashboard-finance-card--chart dashboard-finance-card--trend">
          <div className="dashboard-bento__header">
            <span className="dashboard-bento__eyebrow">Balance trend</span>
            <span className="dashboard-bento__badge">Last 6 months</span>
          </div>
          <div className="dashboard-bento__body">
            <h3>See how wallet activity evolved over time.</h3>
            <p>Track the running balance created by your recent deposits, buys, and redemptions.</p>
          </div>
          <div className="dashboard-chart-shell">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={balanceTrend}>
                <defs>
                  <linearGradient id="balanceTrendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatCompactCurrency} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  formatter={(value) => formatChartCurrency(value)}
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.94)',
                    border: '1px solid rgba(148,163,184,0.16)',
                    borderRadius: 16,
                    color: '#f8fafc',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#818cf8"
                  strokeWidth={3}
                  fill="url(#balanceTrendFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </MagicBentoCard>

        <MagicBentoCard className="dashboard-bento dashboard-finance-card dashboard-finance-card--chart">
          <div className="dashboard-bento__header">
            <span className="dashboard-bento__eyebrow">Spending breakdown</span>
            <span className="dashboard-bento__badge">By category</span>
          </div>
          <div className="dashboard-bento__body">
            <h3>Understand where your money is going.</h3>
            <p>Expenses are grouped into the main categories visible in your financial activity stream.</p>
          </div>
          {spendingBreakdown.length ? (
            <div className="dashboard-chart-shell">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={spendingBreakdown} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid stroke="rgba(148,163,184,0.08)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="category"
                    width={120}
                    tick={{ fill: '#cbd5e1', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => formatChartCurrency(value)}
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.94)',
                      border: '1px solid rgba(148,163,184,0.16)',
                      borderRadius: 16,
                      color: '#f8fafc',
                    }}
                  />
                  <Bar dataKey="amount" radius={[0, 12, 12, 0]} fill="#34d399" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="dashboard-empty-state">
              <p>No spending data yet. Make an investment or pay a fee to see the category mix.</p>
            </div>
          )}
        </MagicBentoCard>

        <MagicBentoCard className="dashboard-bento dashboard-finance-card dashboard-finance-card--insights dashboard-finance-card--full">
          <div className="dashboard-bento__header">
            <span className="dashboard-bento__eyebrow">Insights</span>
            <span className="dashboard-bento__badge">Quick summary</span>
          </div>
          <div className="dashboard-bento__body">
            <h3>Turn raw activity into a few useful observations.</h3>
            <div className="dashboard-insight-list">
              {insightItems.map((item) => (
                <div key={item} className="dashboard-insight-item">
                  <ShieldCheck size={16} />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </MagicBentoCard>
      </MagicBentoGrid>

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
  const [transactions, setTransactions] = useState([]);
  const [holdings, setHoldings] = useState([]);

  useEffect(() => {
    api.get('/funds/public').then((response) => setFunds(response.data)).catch(() => {});

    if (hasRole('INVESTOR')) {
      Promise.all([
        api.get('/investor/profile'),
        api.get('/transactions/history'),
        api.get('/transactions/portfolio'),
      ])
        .then(([profileResponse, historyResponse, portfolioResponse]) => {
          setProfile(profileResponse.data);
          setTransactions(historyResponse.data);
          setHoldings(portfolioResponse.data);
        })
        .catch(() => {});
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
          holdings={holdings}
          transactions={transactions}
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
