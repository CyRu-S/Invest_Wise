import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Portfolio() {
  const [holdings, setHoldings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('holdings');
  const [sellModal, setSellModal] = useState(null);
  const [sellAmount, setSellAmount] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    Promise.all([
      api.get('/transactions/portfolio'),
      api.get('/transactions/history'),
      api.get('/investor/profile')
    ]).then(([h, t, p]) => {
      setHoldings(h.data);
      setTransactions(t.data);
      setProfile(p.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSell = async () => {
    if (!sellAmount || Number(sellAmount) <= 0) return;
    setMessage({ type: '', text: '' });
    try {
      const res = await api.post('/transactions/sell', { fundId: sellModal.fundId, amount: Number(sellAmount) });
      setMessage({ type: 'success', text: res.data.message });
      setSellModal(null);
      setSellAmount('');
      // Refresh
      const [h, t, p] = await Promise.all([
        api.get('/transactions/portfolio'),
        api.get('/transactions/history'),
        api.get('/investor/profile')
      ]);
      setHoldings(h.data);
      setTransactions(t.data);
      setProfile(p.data);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Sell failed' });
    }
  };

  const totalValue = holdings.reduce((sum, h) => sum + Number(h.currentValue), 0);
  const totalInvested = holdings.reduce((sum, h) => sum + (Number(h.unitsOwned) * Number(h.averageBuyPrice)), 0);
  const totalPnL = totalValue - totalInvested;

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;

  return (
    <div className="page-container" id="portfolio-page">
      <div className="page-header">
        <h1>My Portfolio</h1>
        <p>Track your investments and transaction history</p>
      </div>

      {message.text && <div className={message.type === 'success' ? 'success-message' : 'error-message'}>{message.text}</div>}

      {/* Summary Stats */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="glass-card stat-card">
          <div className="stat-label">Wallet Balance</div>
          <div className="stat-value">₹{profile ? Number(profile.walletBalance).toLocaleString('en-IN') : '0'}</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-label">Portfolio Value</div>
          <div className="stat-value">₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-label">Total Invested</div>
          <div className="stat-value">₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-label">Profit / Loss</div>
          <div className={`stat-value ${totalPnL >= 0 ? 'positive' : 'negative'}`}
            style={{ color: totalPnL >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
            {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button className={`btn ${tab === 'holdings' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('holdings')}>
          Holdings ({holdings.length})
        </button>
        <button className={`btn ${tab === 'transactions' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('transactions')}>
          Transactions ({transactions.length})
        </button>
      </div>

      {tab === 'holdings' && (
        <div className="glass-card" style={{ overflow: 'auto' }}>
          {holdings.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No holdings yet. Start investing!</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fund</th>
                  <th>Units</th>
                  <th>Avg Price</th>
                  <th>Current NAV</th>
                  <th>Value</th>
                  <th>P/L</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {holdings.map(h => {
                  const pnl = Number(h.currentValue) - (Number(h.unitsOwned) * Number(h.averageBuyPrice));
                  return (
                    <tr key={h.holdingId}>
                      <td>
                        <strong>{h.fundName}</strong>
                        <br /><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{h.tickerSymbol}</span>
                      </td>
                      <td>{Number(h.unitsOwned).toFixed(4)}</td>
                      <td>₹{Number(h.averageBuyPrice).toFixed(2)}</td>
                      <td>₹{Number(h.currentNav).toFixed(2)}</td>
                      <td>₹{Number(h.currentValue).toFixed(2)}</td>
                      <td style={{ color: pnl >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                        {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)}
                      </td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => setSellModal(h)}>Sell</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'transactions' && (
        <div className="glass-card" style={{ overflow: 'auto' }}>
          {transactions.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No transactions yet.</p>
          ) : (
            <table className="data-table">
              <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Status</th><th>Details</th></tr></thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${tx.type === 'BUY' ? 'success' : tx.type === 'SELL' ? 'danger' : 'info'}`}>{tx.type}</span></td>
                    <td>₹{Number(tx.amount).toFixed(2)}</td>
                    <td><span className={`badge badge-${tx.status === 'SUCCESS' ? 'success' : 'warning'}`}>{tx.status}</span></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{tx.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Sell Modal */}
      {sellModal && (
        <div className="modal-overlay" onClick={() => setSellModal(null)}>
          <div className="glass-card modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem' }}>Sell {sellModal.fundName}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              You own {Number(sellModal.unitsOwned).toFixed(4)} units. Current NAV: ₹{Number(sellModal.currentNav).toFixed(2)}
            </p>
            <div className="form-group">
              <label>Sell Amount (₹)</label>
              <input type="number" className="form-control" value={sellAmount} onChange={e => setSellAmount(e.target.value)} min="1" />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-danger" onClick={handleSell}>Confirm Sell</button>
              <button className="btn btn-ghost" onClick={() => setSellModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
