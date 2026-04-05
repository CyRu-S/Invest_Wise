import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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

function titleCase(value) {
  return String(value || '')
    .toLowerCase()
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeTransaction(transaction) {
  const fallbackCashflow =
    transaction.type === 'DEPOSIT' || transaction.type === 'SELL' ? 'INCOME' : 'EXPENSE';

  return {
    ...transaction,
    amount: Number(transaction.amount || 0),
    cashflowType: transaction.cashflowType || fallbackCashflow,
    category: transaction.category || 'General',
    title: transaction.title || transaction.description || titleCase(transaction.type),
  };
}

export default function Portfolio() {
  const [holdings, setHoldings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('holdings');
  const [sellModal, setSellModal] = useState(null);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [transactionQuery, setTransactionQuery] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('ALL');
  const [transactionCategoryFilter, setTransactionCategoryFilter] = useState('ALL');
  const [transactionSort, setTransactionSort] = useState('latest');

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

  const handleDeposit = async () => {
    if (!depositAmount || Number(depositAmount) <= 0) return;

    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('/investor/deposit', {
        amount: Number(depositAmount),
      });

      setMessage({
        type: 'success',
        text: response.data.message || 'Funds added to wallet successfully.',
      });
      setDepositModalOpen(false);
      setDepositAmount('');
      await loadPortfolio();
      setTab('transactions');
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to add funds right now.',
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

  const normalizedTransactions = useMemo(
    () => transactions.map(normalizeTransaction),
    [transactions]
  );

  const transactionCategories = useMemo(
    () => Array.from(new Set(normalizedTransactions.map((transaction) => transaction.category))).sort(),
    [normalizedTransactions]
  );

  const filteredTransactions = useMemo(() => {
    const filtered = normalizedTransactions.filter((transaction) => {
      const matchesQuery =
        !transactionQuery ||
        transaction.title?.toLowerCase().includes(transactionQuery.toLowerCase()) ||
        transaction.description?.toLowerCase().includes(transactionQuery.toLowerCase()) ||
        transaction.category?.toLowerCase().includes(transactionQuery.toLowerCase()) ||
        transaction.tickerSymbol?.toLowerCase().includes(transactionQuery.toLowerCase());
      const matchesType =
        transactionTypeFilter === 'ALL' || transaction.cashflowType === transactionTypeFilter;
      const matchesCategory =
        transactionCategoryFilter === 'ALL' || transaction.category === transactionCategoryFilter;

      return matchesQuery && matchesType && matchesCategory;
    });

    return filtered.sort((left, right) => {
      if (transactionSort === 'amount-desc') return right.amount - left.amount;
      if (transactionSort === 'amount-asc') return left.amount - right.amount;
      if (transactionSort === 'oldest') return new Date(left.createdAt) - new Date(right.createdAt);
      return new Date(right.createdAt) - new Date(left.createdAt);
    });
  }, [
    normalizedTransactions,
    transactionCategoryFilter,
    transactionQuery,
    transactionSort,
    transactionTypeFilter,
  ]);

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
          <div className="portfolio-hero__actions">
            <button className="portfolio-hero__button portfolio-hero__button--primary" onClick={() => setDepositModalOpen(true)}>
              <Wallet size={16} />
              Add Funds
            </button>
            <Link to="/funds" className="portfolio-hero__button portfolio-hero__button--ghost">
              <PieChart size={16} />
              Explore funds
            </Link>
          </div>
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
                Explore transactions by date, amount, category, and income or expense type. Search,
                filter, and sort the list to quickly understand your financial activity.
              </p>
            </div>
          </MagicBentoCard>

          <MagicBentoCard className="portfolio-card portfolio-card--full portfolio-card--transactions-panel">
            <div className="portfolio-transactions-toolbar">
              <label className="portfolio-toolbar-field portfolio-toolbar-field--search">
                <input
                  type="text"
                  value={transactionQuery}
                  onChange={(event) => setTransactionQuery(event.target.value)}
                  placeholder="Search by title, description, ticker, or category"
                />
              </label>

              <label className="portfolio-toolbar-field portfolio-toolbar-field--select">
                <span>Type</span>
                <select value={transactionTypeFilter} onChange={(event) => setTransactionTypeFilter(event.target.value)}>
                  <option value="ALL">All types</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </label>

              <label className="portfolio-toolbar-field portfolio-toolbar-field--select">
                <span>Category</span>
                <select
                  value={transactionCategoryFilter}
                  onChange={(event) => setTransactionCategoryFilter(event.target.value)}
                >
                  <option value="ALL">All categories</option>
                  {transactionCategories.map((category) => (
                    <option key={category} value={category}>
                      {titleCase(category)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="portfolio-toolbar-field portfolio-toolbar-field--select">
                <span>Sort</span>
                <select value={transactionSort} onChange={(event) => setTransactionSort(event.target.value)}>
                  <option value="latest">Latest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="amount-desc">Amount high to low</option>
                  <option value="amount-asc">Amount low to high</option>
                </select>
              </label>
            </div>

            {normalizedTransactions.length === 0 ? (
              <div className="portfolio-empty-state">
                <h3>No transactions yet</h3>
                <p>Your completed buys, sells, deposits, and fee payments will appear here as activity starts.</p>
              </div>
            ) : filteredTransactions.length ? (
              <div className="portfolio-transaction-table-shell">
                <table className="portfolio-transaction-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Transaction</th>
                      <th>Category</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{formatTransactionDate(transaction.createdAt)}</td>
                        <td>
                          <div className="portfolio-transaction-table__title">
                            <strong>{transaction.title}</strong>
                            <span>{transaction.description || `Ref #${transaction.id}`}</span>
                          </div>
                        </td>
                        <td>{titleCase(transaction.category)}</td>
                        <td>
                          <span className={`portfolio-status portfolio-status--${transaction.cashflowType.toLowerCase()}`}>
                            {titleCase(transaction.cashflowType)}
                          </span>
                        </td>
                        <td className={transaction.cashflowType === 'INCOME' ? 'is-positive' : 'is-negative'}>
                          {transaction.cashflowType === 'INCOME' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td>
                          <span className={`portfolio-status portfolio-status--${transaction.status?.toLowerCase()}`}>
                            {titleCase(transaction.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="portfolio-empty-state">
                <h3>No transactions match the current filters.</h3>
                <p>Try clearing the search or broadening the selected transaction filters.</p>
              </div>
            )}
          </MagicBentoCard>
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

      {depositModalOpen && (
        <div className="portfolio-modal-overlay" onClick={() => setDepositModalOpen(false)}>
          <div className="portfolio-modal" onClick={(event) => event.stopPropagation()}>
            <div className="portfolio-modal__header">
              <div className="portfolio-modal__title-block">
                <span className="portfolio-card__eyebrow">
                  <Wallet size={15} />
                  Wallet funding
                </span>
                <h3>Add capital to your wallet</h3>
                <p>
                  Top up your cash balance first, then move directly into advisor bookings or fund purchases without leaving the workspace.
                </p>
              </div>
              <button className="portfolio-modal__close" onClick={() => setDepositModalOpen(false)}>
                Close
              </button>
            </div>

            <div className="portfolio-modal__summary">
              <div>
                <span>Current wallet</span>
                <strong>{formatCurrency(profile?.walletBalance)}</strong>
              </div>
              <div>
                <span>Suggested top-up</span>
                <strong>{formatCurrency(25000)}</strong>
              </div>
            </div>

            <div className="portfolio-quick-amounts">
              {[5000, 10000, 25000, 50000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className={`portfolio-quick-amount ${Number(depositAmount) === amount ? 'is-active' : ''}`}
                  onClick={() => setDepositAmount(String(amount))}
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>

            <label className="portfolio-modal__field" htmlFor="deposit-amount">
              <span>Deposit amount</span>
              <input
                id="deposit-amount"
                type="number"
                min="1"
                value={depositAmount}
                onChange={(event) => setDepositAmount(event.target.value)}
                placeholder="Enter amount"
              />
            </label>

            <div className="portfolio-modal__actions">
              <button className="btn btn-primary" onClick={handleDeposit}>
                <Landmark size={16} />
                Add to wallet
              </button>
              <button className="btn btn-ghost" onClick={() => setDepositModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
