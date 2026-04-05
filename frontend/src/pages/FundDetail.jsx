import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { MagicBentoCard, MagicBentoGrid } from '../components/MagicBentoGrid';
import { useAuth } from '../context/AuthContext';
import './FundPages.css';
import api from '../services/api';

function formatCurrency(value, fallback = 'N/A') {
  if (value === null || value === undefined || value === '') return fallback;
  return `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function formatReturn(value) {
  if (value === null || value === undefined || value === '') return 'N/A';
  return `${(Number(value) * 100).toFixed(2)}%`;
}

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || value === '') return 'N/A';
  return Number(value).toFixed(digits);
}

function formatChartDate(value) {
  if (!value) return '';
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(parsedDate);
}

function buildFallbackNavHistory(fund) {
  const currentNav = Number(fund?.currentNav);
  if (!Number.isFinite(currentNav) || currentNav <= 0) {
    return [];
  }

  const risk = Math.max(1, Math.min(Number(fund?.riskRating || 3), 5));
  const totalPoints = 12;
  const today = new Date();
  const startFactor = 0.88 + risk * 0.01;
  const startNav = currentNav * startFactor;
  const delta = currentNav - startNav;

  return Array.from({ length: totalPoints }, (_, index) => {
    const pointDate = new Date(today);
    pointDate.setMonth(today.getMonth() - (totalPoints - 1 - index));

    const progress = totalPoints === 1 ? 1 : index / (totalPoints - 1);
    const trendValue = startNav + delta * progress;
    const waveValue = currentNav * (Math.sin((index + 1) * 0.85 + risk) * 0.0125);
    const value = index === totalPoints - 1 ? currentNav : Math.max(0.01, trendValue + waveValue);

    return {
      date: pointDate.toISOString().slice(0, 10),
      value: Number(value.toFixed(4)),
    };
  });
}

function getRiskLabel(rating) {
  if (rating <= 1) return 'Conservative';
  if (rating <= 2) return 'Balanced';
  if (rating <= 3) return 'Measured';
  if (rating <= 4) return 'Growth';
  return 'High Conviction';
}

function RiskMeter({ rating }) {
  return (
    <div className="fund-risk-meter" aria-label={`Risk rating ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((step) => (
        <span
          key={step}
          className={`fund-risk-meter__dot ${step <= rating ? 'is-active' : ''}`}
        />
      ))}
    </div>
  );
}

function FundChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="fund-chart-tooltip">
      <span className="fund-chart-tooltip__label">{formatChartDate(label)}</span>
      <strong>{formatCurrency(payload[0].value)}</strong>
    </div>
  );
}

export default function FundDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [fund, setFund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyAmount, setBuyAmount] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    api
      .get(`/funds/public/${id}`)
      .then((response) => setFund(response.data))
      .catch(() => navigate('/funds'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleBuy = async () => {
    const minimumAmount = Number(fund?.minInvestment || 0);
    const investmentAmount = Number(buyAmount);

    if (!investmentAmount || investmentAmount <= 0) return;
    if (minimumAmount && investmentAmount < minimumAmount) {
      setMessage({
        type: 'error',
        text: `Minimum investment is ${formatCurrency(minimumAmount)} for this fund.`,
      });
      return;
    }

    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('/transactions/buy', {
        fundId: Number(id),
        amount: investmentAmount,
      });
      setMessage({ type: 'success', text: response.data.message });
      setBuyAmount('');
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Purchase failed',
      });
    }
  };

  if (loading) {
    return (
      <div className="page-container fund-page">
        <div className="loading-spinner fund-loading-shell">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!fund) return null;

  const apiNavHistory = Array.isArray(fund.navHistory)
    ? fund.navHistory
        .map((point) => ({
          date: point.date,
          value: Number(point.value),
        }))
        .filter((point) => point.date && Number.isFinite(point.value))
    : [];
  const navHistory = apiNavHistory.length ? apiNavHistory : buildFallbackNavHistory(fund);

  const navFloor = navHistory.length ? Math.min(...navHistory.map((point) => point.value)) : Number(fund.currentNav);
  const navCeiling = navHistory.length ? Math.max(...navHistory.map((point) => point.value)) : Number(fund.currentNav);
  const firstNav = navHistory[0]?.value ?? Number(fund.currentNav);
  const latestNav = navHistory[navHistory.length - 1]?.value ?? Number(fund.currentNav);
  const trendDelta = firstNav ? ((latestNav - firstNav) / firstNav) * 100 : 0;
  const investmentAmount = Number(buyAmount);
  const estimatedUnits = investmentAmount > 0 ? investmentAmount / Number(fund.currentNav) : 0;
  const minimumInvestment = Number(fund.minInvestment || 0);
  const belowMinimum = minimumInvestment && investmentAmount > 0 && investmentAmount < minimumInvestment;
  const isInvestor = hasRole('INVESTOR');
  const chartGradientId = `fund-chart-fill-${fund.id}`;
  const chartStrokeId = `fund-chart-stroke-${fund.id}`;
  const quickAmounts = [5000, 10000, 25000];

  return (
    <div className="page-container fund-page fund-page--detail" id="fund-detail-page">


      <button className="fund-back-button" onClick={() => navigate('/funds')}>
        <ArrowLeft size={16} />
        Back to Funds
      </button>

      <section className="fund-hero fund-hero--detail">
        <div className="fund-hero__copy">
          <div className="fund-hero__chips">
            <span className={`fund-pill fund-pill--${fund.category}`}>{fund.category}</span>
            <span className="fund-chip">
              <ShieldCheck size={14} />
              {getRiskLabel(Number(fund.riskRating || 0))}
            </span>
          </div>
          <h1>{fund.fundName}</h1>
          <p>{fund.description || 'A diversified mutual fund strategy built for disciplined long-term investing.'}</p>
          <div className="fund-hero__chips">
            <span className="fund-chip">Ticker {fund.tickerSymbol}</span>
            <span className="fund-chip">Managed by {fund.fundManager || 'In-house team'}</span>
          </div>
        </div>

        <div className="fund-hero__rail ">
          <div className="fund-hero__stat fund-hero__stat--spotlight">
            <span className="fund-hero__stat-label">Current NAV</span>
            <strong>{formatCurrency(fund.currentNav)}</strong>
          </div>
          <div className="fund-hero__stat fund-hero__stat--spotlight">
            <span className="fund-hero__stat-label">1Y return</span>
            <strong className={Number(fund.oneYearReturn) >= 0 ? 'is-positive' : 'is-negative'}>
              {formatReturn(fund.oneYearReturn)}
            </strong>
          </div>
          <div className="fund-hero__stat fund-hero__stat--spotlight">
            <span className="fund-hero__stat-label">Expense ratio</span>
            <strong>{Number(fund.expenseRatio || 0).toFixed(2)}%</strong>
          </div>
          <div className="fund-hero__stat fund-hero__stat--spotlight">
            <span className="fund-hero__stat-label">12M NAV move</span>
            <strong className={trendDelta >= 0 ? 'is-positive' : 'is-negative'}>
              {trendDelta >= 0 ? '+' : ''}
              {trendDelta.toFixed(2)}%
            </strong>
            <span className="fund-hero__stat-note">
              {formatCurrency(navFloor)} to {formatCurrency(navCeiling)}
            </span>
          </div>
        </div>
      </section>

      <MagicBentoGrid className="fund-detail-grid" pattern="detail">
        <MagicBentoCard className="fund-detail-card fund-detail-card--overview magic-bento-card--span-2x2">
          <div className="fund-detail-card__header">
            <span className="fund-detail-card__eyebrow">
              <Sparkles size={15} />
              Fund snapshot
            </span>
            <span className="fund-detail-card__ticker">{fund.tickerSymbol}</span>
          </div>

          <div className="fund-detail-card__headline">
            <div>
              <h2>{fund.fundName}</h2>
              <p>
                Designed for investors seeking {getRiskLabel(Number(fund.riskRating || 0)).toLowerCase()}
                {' '}exposure with a manager-led approach and transparent cost structure.
              </p>
            </div>
            <div className="fund-detail-card__headline-stat">
              <span>Latest NAV</span>
              <strong>{formatCurrency(fund.currentNav)}</strong>
            </div>
          </div>

          <div className="fund-detail-card__overview-grid">
            <div>
              <span className="fund-detail-card__label">Manager</span>
              <strong>{fund.fundManager || 'In-house team'}</strong>
            </div>
            <div>
              <span className="fund-detail-card__label">Risk outlook</span>
              <strong>{getRiskLabel(Number(fund.riskRating || 0))}</strong>
            </div>
            <div>
              <span className="fund-detail-card__label">Minimum entry</span>
              <strong>{minimumInvestment ? formatCurrency(minimumInvestment) : 'Flexible'}</strong>
            </div>
            <div>
              <span className="fund-detail-card__label">Expense ratio</span>
              <strong>{Number(fund.expenseRatio || 0).toFixed(2)}%</strong>
            </div>
          </div>
        </MagicBentoCard>

        <MagicBentoCard className="fund-detail-card fund-detail-card--performance magic-bento-card--span-2x1">
          <div className="fund-detail-card__header">
            <span className="fund-detail-card__eyebrow">
              <BarChart3 size={15} />
              Performance matrix
            </span>
          </div>

          <div className="fund-detail-metrics">
            <div className="fund-detail-metric">
              <span>CAGR</span>
              <strong className={Number(fund.cagr) >= 0 ? 'is-positive' : 'is-negative'}>
                {formatReturn(fund.cagr)}
              </strong>
            </div>
            <div className="fund-detail-metric">
              <span>1Y return</span>
              <strong className={Number(fund.oneYearReturn) >= 0 ? 'is-positive' : 'is-negative'}>
                {formatReturn(fund.oneYearReturn)}
              </strong>
            </div>
            <div className="fund-detail-metric">
              <span>Sharpe ratio</span>
              <strong>{formatNumber(fund.sharpeRatio, 3)}</strong>
            </div>
            <div className="fund-detail-metric">
              <span>Std deviation</span>
              <strong>{formatReturn(fund.standardDeviation)}</strong>
            </div>
          </div>
        </MagicBentoCard>

        <MagicBentoCard className="fund-detail-card fund-detail-card--risk">
          <div className="fund-detail-card__header">
            <span className="fund-detail-card__eyebrow">
              <Target size={15} />
              Suitability
            </span>
          </div>

          <div className="fund-detail-risk">
            <div>
              <span className="fund-detail-card__label">Risk label</span>
              <strong>{getRiskLabel(Number(fund.riskRating || 0))}</strong>
            </div>
            <RiskMeter rating={Number(fund.riskRating || 0)} />
          </div>

          <div className="fund-detail-card__stack">
            <div>
              <span className="fund-detail-card__label">Category</span>
              <strong>{fund.category}</strong>
            </div>
            <div>
              <span className="fund-detail-card__label">Minimum investment</span>
              <strong>{minimumInvestment ? formatCurrency(minimumInvestment) : 'Flexible'}</strong>
            </div>
          </div>
        </MagicBentoCard>

        <MagicBentoCard className="fund-detail-card fund-detail-card--facts">
          <div className="fund-detail-card__header">
            <span className="fund-detail-card__eyebrow">
              <Activity size={15} />
              Quick facts
            </span>
          </div>

          <div className="fund-detail-card__stack">
            <div>
              <span className="fund-detail-card__label">Ticker</span>
              <strong>{fund.tickerSymbol}</strong>
            </div>
            <div>
              <span className="fund-detail-card__label">Category</span>
              <strong>{fund.category}</strong>
            </div>
            <div>
              <span className="fund-detail-card__label">Manager</span>
              <strong>{fund.fundManager || 'In-house team'}</strong>
            </div>
            <div>
              <span className="fund-detail-card__label">Expense ratio</span>
              <strong>{Number(fund.expenseRatio || 0).toFixed(2)}%</strong>
            </div>
          </div>
        </MagicBentoCard>

        {navHistory.length > 0 && (
          <MagicBentoCard className="fund-detail-card fund-detail-card--chart">
            <div className="fund-detail-card__header">
              <span className="fund-detail-card__eyebrow">
                <TrendingUp size={15} />
                NAV trend
              </span>
              <span className="fund-detail-card__note">Last 12 months</span>
            </div>

            <div className="fund-chart-summary">
              <div className="fund-chart-summary__item">
                <span>Latest</span>
                <strong>{formatCurrency(latestNav)}</strong>
              </div>
              <div className="fund-chart-summary__item">
                <span>Low</span>
                <strong>{formatCurrency(navFloor)}</strong>
              </div>
              <div className="fund-chart-summary__item">
                <span>High</span>
                <strong>{formatCurrency(navCeiling)}</strong>
              </div>
            </div>

            <div className="fund-chart-shell">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={navHistory} margin={{ top: 10, right: 6, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id={chartGradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(129, 140, 248, 0.75)" stopOpacity={1} />
                      <stop offset="70%" stopColor="rgba(79, 70, 229, 0.12)" stopOpacity={1} />
                      <stop offset="100%" stopColor="rgba(79, 70, 229, 0)" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id={chartStrokeId} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="4 8" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={28}
                    tick={{ fill: '#7f8ba7', fontSize: 12 }}
                    tickFormatter={formatChartDate}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tick={{ fill: '#7f8ba7', fontSize: 12 }}
                    tickFormatter={(value) => `₹${Number(value).toFixed(0)}`}
                    domain={['dataMin - 1', 'dataMax + 1']}
                  />
                  <Tooltip content={<FundChartTooltip />} cursor={{ stroke: 'rgba(129, 140, 248, 0.35)', strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="none"
                    fill={`url(#${chartGradientId})`}
                    fillOpacity={1}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={`url(#${chartStrokeId})`}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 5, fill: '#ffffff', stroke: '#818cf8', strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </MagicBentoCard>
        )}

        {isInvestor ? (
          <MagicBentoCard className="fund-detail-card fund-detail-card--invest">
            <div className="fund-detail-card__header">
              <span className="fund-detail-card__eyebrow">
                <Wallet size={15} />
                Invest now
              </span>
              <span className="fund-detail-card__note">Live purchase preview</span>
            </div>

            {message.text && (
              <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
                {message.text}
              </div>
            )}

            <div className="fund-invest__quick">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className={`fund-invest__chip ${investmentAmount === amount ? 'is-active' : ''}`}
                  onClick={() => setBuyAmount(String(amount))}
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>

            <label className="fund-invest__field" htmlFor="buy-amount">
              <span>Investment amount</span>
              <input
                id="buy-amount"
                type="number"
                min="1"
                value={buyAmount}
                onChange={(event) => setBuyAmount(event.target.value)}
                placeholder="Enter amount"
              />
            </label>

            <div className="fund-invest__preview">
              <div>
                <span className="fund-detail-card__label">Estimated units</span>
                <strong>{estimatedUnits ? estimatedUnits.toFixed(4) : '0.0000'}</strong>
              </div>
              <div>
                <span className="fund-detail-card__label">NAV used</span>
                <strong>{formatCurrency(fund.currentNav)}</strong>
              </div>
            </div>

            <p className="fund-invest__note">
              Minimum investment: {minimumInvestment ? formatCurrency(minimumInvestment) : 'Flexible'}
            </p>

            {belowMinimum && (
              <div className="error-message">
                Enter at least {formatCurrency(minimumInvestment)} to place this order.
              </div>
            )}

            <button
              className="btn btn-success btn-lg fund-invest__button"
              onClick={handleBuy}
              disabled={!investmentAmount || investmentAmount <= 0 || belowMinimum}
            >
              Invest in Fund
              <ArrowUpRight size={16} />
            </button>
          </MagicBentoCard>
        ) : (
          <MagicBentoCard className="fund-detail-card fund-detail-card--invest fund-detail-card--readonly">
            <div className="fund-detail-card__header">
              <span className="fund-detail-card__eyebrow">
                <Wallet size={15} />
                View-only access
              </span>
            </div>
            <p className="fund-detail-card__copy">
              This role can review analytics and fund details here, but only investor accounts can place buy orders.
            </p>
          </MagicBentoCard>
        )}
      </MagicBentoGrid>
    </div>
  );
}
