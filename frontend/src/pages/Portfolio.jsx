import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Briefcase,
  CalendarClock,
  CreditCard,
  Landmark,
  PieChart,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { MagicBentoCard, MagicBentoGrid } from '../components/MagicBentoGrid';
import './PortfolioPage.css';
import api from '../services/api';

function formatCurrency(value, fallback = '₹0') {
  if (value === null || value === undefined || value === '') return fallback;
  return `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function formatCompactCurrency(value) {
  if (!value) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatPercent(value, fallback = 'N/A') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return fallback;
  return `${Number(value).toFixed(2)}%`;
}

function formatTransactionDate(value) {
  if (!value) return 'Pending';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export default function Portfolio() {
  const [holdings, setHoldings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('holdings');
  const [sellModal, setSellModal] = useState(null);
  const [sellAmount, setSellAmount] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadPortfolio = async () => {
    setLoading(true);

    try {
      const [portfolioResponse, historyResponse, profileResponse] = await Promise.all([
        api.get('/transactions/portfolio'),
        api.get('/transactions/history'),
        api.get('/investor/profile'),
      ]);

      setHoldings(portfolioResponse.data);
      setTransactions(historyResponse.data);
      setProfile(profileResponse.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const handleSell = async () => {
    if (!sellAmount || Number(sellAmount) <= 0 || !sellModal) return;

    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('/transactions/sell', {
        fundId: sellModal.fundId,
        amount: Number(sellAmount),
      });

      setMessage({ type: 'success', text: response.data.message });
      setSellModal(null);
      setSellAmount('');
      await loadPortfolio();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Sell failed',
      });
    }
  };

  const {
    totalValue,
    totalInvested,
    totalPnL,
    totalPnLPercent,
    bestHolding,
    totalUnits,
  } = useMemo(() => {
    const portfolioValue = holdings.reduce((sum, holding) => sum + Number(holding.currentValue || 0), 0);
    const investedValue = holdings.reduce(
      (sum, holding) => sum + Number(holding.unitsOwned || 0) * Number(holding.averageBuyPrice || 0),
      0
    );
    const pnl = portfolioValue - investedValue;
    const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
    const units = holdings.reduce((sum, holding) => sum + Number(holding.unitsOwned || 0), 0);

    const standoutHolding = holdings.reduce((best, holding) => {
      const holdingPnl = Number(holding.currentValue || 0) - Number(holding.unitsOwned || 0) * Number(holding.averageBuyPrice || 0);
      if (!best) return { ...holding, pnl: holdingPnl };
      return holdingPnl > best.pnl ? { ...holding, pnl: holdingPnl } : best;
    }, null);

    return {
      totalValue: portfolioValue,
      totalInvested: investedValue,
      totalPnL: pnl,
      totalPnLPercent: pnlPercent,
      bestHolding: standoutHolding,
      totalUnits: units,
    };
  }, [holdings]);

  const recentTransactions = useMemo(
    () => transactions.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [transactions]
  );

  if (loading) {
    return (
      <div className="page-container portfolio-page">
        <div className="portfolio-loading-shell">
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container portfolio-page" id="portfolio-page">

      <section className="portfolio-hero">
        <div className="portfolio-hero__copy">
          <span className="portfolio-hero__kicker">
            <Briefcase size={16} />
            Investor Portfolio
          </span>
          <h1>Your capital, performance, and activity in one place.</h1>
          <p>
            Review live value, understand how much is invested, and take action on each holding
            without dropping into plain tables.
          </p>
        </div>

        <div className="portfolio-hero__summary">
          <div className="portfolio-hero__stat portfolio-hero__stat--indigo">
            <span>Wallet balance</span>
            <strong>{formatCurrency(profile?.walletBalance)}</strong>
          </div>
          <div className="portfolio-hero__stat portfolio-hero__stat--indigo">
            <span>Portfolio value</span>
            <strong>{formatCurrency(totalValue)}</strong>
          </div>
          <div className="portfolio-hero__stat portfolio-hero__stat--indigo">
            <span>Total invested</span>
            <strong>{formatCurrency(totalInvested)}</strong>
          </div>
          <div className="portfolio-hero__stat portfolio-hero__stat--indigo">
            <span>P/L</span>
            <strong className={totalPnL >= 0 ? 'is-positive' : 'is-negative'}>
              {totalPnL >= 0 ? '+' : ''}
              {formatCurrency(totalPnL, '₹0')}
            </strong>
            <small>{totalInvested > 0 ? formatPercent(totalPnLPercent) : 'No invested capital yet'}</small>
          </div>
        </div>
      </section>

      {message.text && (
        <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
          {message.text}
        </div>
      )}

      <section className="portfolio-tabs" aria-label="Portfolio views">
        <button
          className={`portfolio-tab ${tab === 'holdings' ? 'is-active' : ''}`}
          onClick={() => setTab('holdings')}
        >
          Holdings
          <span>{holdings.length}</span>
        </button>
        <button
          className={`portfolio-tab ${tab === 'transactions' ? 'is-active' : ''}`}
          onClick={() => setTab('transactions')}
        >
          Transactions
          <span>{transactions.length}</span>
        </button>
      </section>

      {tab === 'holdings' && (
        <>
          <MagicBentoGrid className="portfolio-grid" pattern="uniform">
            <MagicBentoCard className="portfolio-card portfolio-card--overview portfolio-card--lead portfolio-card--full">
              <div className="portfolio-card__header">
                <span className="portfolio-card__eyebrow">Portfolio overview</span>
                <span className="portfolio-card__badge">Live snapshot</span>
              </div>
              <div className="portfolio-card__body">
                <h2>Keep your positions and liquidity in balance.</h2>
                <p>
                  Use this view to identify your strongest holding, track unrealized gains, and
                  liquidate positions quickly when your allocation changes.
                </p>
              </div>
              <div className="portfolio-overview-metrics">
                <div className="portfolio-overview-metric">
                  <span>Total units</span>
                  <strong>{totalUnits.toFixed(4)}</strong>
                </div>
                <div className="portfolio-overview-metric">
                  <span>Best contributor</span>
                  <strong>{bestHolding?.tickerSymbol || 'No holdings yet'}</strong>
                </div>
                <div className="portfolio-overview-metric">
                  <span>Largest gain</span>
                  <strong className={bestHolding?.pnl >= 0 ? 'is-positive' : ''}>
                    {bestHolding ? formatCompactCurrency(bestHolding.pnl) : '₹0'}
                  </strong>
                </div>
                <div className="portfolio-overview-metric">
                  <span>Cash available</span>
                  <strong>{formatCompactCurrency(profile?.walletBalance)}</strong>
                </div>
              </div>
            </MagicBentoCard>

            {holdings.length === 0 ? (
              <MagicBentoCard className="portfolio-card portfolio-card--empty portfolio-card--full">
                <div className="portfolio-card__body">
                  <h3>No holdings yet</h3>
                  <p>Start investing from the fund explorer and your positions will appear here.</p>
                </div>
              </MagicBentoCard>
            ) : (
              holdings.map((holding) => {
                const pnl =
                  Number(holding.currentValue || 0) -
                  Number(holding.unitsOwned || 0) * Number(holding.averageBuyPrice || 0);
                const pnlPercent =
                  Number(holding.unitsOwned || 0) * Number(holding.averageBuyPrice || 0) > 0
                    ? (pnl / (Number(holding.unitsOwned || 0) * Number(holding.averageBuyPrice || 0))) * 100
                    : 0;

                return (
                  <MagicBentoCard key={holding.holdingId} className="portfolio-card">
                    <div className="portfolio-card__header">
                      <div className="portfolio-card__title-block">
                        <span className="portfolio-card__eyebrow">{holding.tickerSymbol}</span>
                        <h3>{holding.fundName}</h3>
                      </div>
                      <button
                        className="portfolio-card__sell"
                        onClick={() => setSellModal(holding)}
                      >
                        Sell
                      </button>
                    </div>

                    <div className="portfolio-holding-metrics">
                      <div>
                        <span>Value</span>
                        <strong>{formatCurrency(holding.currentValue)}</strong>
                      </div>
                      <div>
                        <span>Units</span>
                        <strong>{Number(holding.unitsOwned || 0).toFixed(4)}</strong>
                      </div>
                      <div>
                        <span>Avg buy</span>
                        <strong>{formatCurrency(holding.averageBuyPrice)}</strong>
                      </div>
                      <div>
                        <span>Current NAV</span>
                        <strong>{formatCurrency(holding.currentNav)}</strong>
                      </div>
                    </div>

                    <div className="portfolio-card__footer">
                      <div>
                        <span>Unrealized P/L</span>
                        <strong className={pnl >= 0 ? 'is-positive' : 'is-negative'}>
                          {pnl >= 0 ? '+' : ''}
                          {formatCurrency(pnl)}
                        </strong>
                      </div>
                      <div>
                        <span>Return</span>
                        <strong className={pnlPercent >= 0 ? 'is-positive' : 'is-negative'}>
                          {pnlPercent >= 0 ? '+' : ''}
                          {formatPercent(pnlPercent)}
                        </strong>
                      </div>
                    </div>
                  </MagicBentoCard>
                );
              })
            )}
          </MagicBentoGrid>
        </>
      )}

      {tab === 'transactions' && (
        <MagicBentoGrid className="portfolio-transaction-grid" pattern="uniform">
            <MagicBentoCard className="portfolio-card portfolio-card--overview portfolio-card--lead portfolio-card--full">
            <div className="portfolio-card__header">
              <span className="portfolio-card__eyebrow">Activity log</span>
              <span className="portfolio-card__badge">Latest first</span>
            </div>
            <div className="portfolio-card__body">
              <h2>Review how money moved through your account.</h2>
              <p>
                Every buy and sell stays visible with status, date, amount, and notes so you can
                audit your investing decisions quickly.
              </p>
            </div>
          </MagicBentoCard>

          {recentTransactions.length === 0 ? (
            <MagicBentoCard className="portfolio-card portfolio-card--empty portfolio-card--full">
              <div className="portfolio-card__body">
                <h3>No transactions yet</h3>
                <p>Your completed buys and sells will appear here as soon as activity starts.</p>
              </div>
            </MagicBentoCard>
          ) : (
            recentTransactions.map((transaction) => (
              <MagicBentoCard key={transaction.id} className="portfolio-card portfolio-card--transaction">
                <div className="portfolio-card__header">
                  <span className={`portfolio-status portfolio-status--${transaction.type?.toLowerCase()}`}>
                    {transaction.type}
                  </span>
                  <span className={`portfolio-status portfolio-status--${transaction.status?.toLowerCase()}`}>
                    {transaction.status}
                  </span>
                </div>

                <div className="portfolio-card__body">
                  <h3>{formatCurrency(transaction.amount)}</h3>
                  <p>{transaction.description || 'Transaction details will appear here.'}</p>
                </div>

                <div className="portfolio-transaction-meta">
                  <div>
                    <span>
                      <CalendarClock size={14} />
                      Date
                    </span>
                    <strong>{formatTransactionDate(transaction.createdAt)}</strong>
                  </div>
                  <div>
                    <span>
                      <CreditCard size={14} />
                      Ref
                    </span>
                    <strong>#{transaction.id}</strong>
                  </div>
                </div>
              </MagicBentoCard>
            ))
          )}
        </MagicBentoGrid>
      )}

      {sellModal && (
        <div className="portfolio-modal-overlay" onClick={() => setSellModal(null)}>
          <div className="portfolio-modal" onClick={(event) => event.stopPropagation()}>
          <div className="portfolio-modal__header">
              <div className="portfolio-modal__title-block">
                <span className="portfolio-card__eyebrow">{sellModal.tickerSymbol}</span>
                <h3>Sell {sellModal.fundName}</h3>
                <p>
                  Review your live position details and enter the rupee amount you want to liquidate.
                </p>
              </div>
              <button className="portfolio-modal__close" onClick={() => setSellModal(null)}>
                Close
              </button>
            </div>

            <div className="portfolio-modal__summary">
              <div>
                <span>Units owned</span>
                <strong>{Number(sellModal.unitsOwned || 0).toFixed(4)}</strong>
              </div>
              <div>
                <span>Current NAV</span>
                <strong>{formatCurrency(sellModal.currentNav)}</strong>
              </div>
            </div>

            <label className="portfolio-modal__field" htmlFor="sell-amount">
              <span>Sell amount</span>
              <input
                id="sell-amount"
                type="number"
                min="1"
                value={sellAmount}
                onChange={(event) => setSellAmount(event.target.value)}
                placeholder="Enter amount"
              />
            </label>

            <div className="portfolio-modal__actions">
              <button className="btn btn-danger" onClick={handleSell}>
                Confirm Sell
                <ArrowUpRight size={16} />
              </button>
              <button className="btn btn-ghost" onClick={() => setSellModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
