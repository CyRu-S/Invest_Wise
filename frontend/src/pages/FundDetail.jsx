import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function FundDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [fund, setFund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyAmount, setBuyAmount] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get(`/funds/public/${id}`)
      .then(r => setFund(r.data))
      .catch(() => navigate('/funds'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBuy = async () => {
    if (!buyAmount || Number(buyAmount) <= 0) return;
    setMessage({ type: '', text: '' });
    try {
      const res = await api.post('/transactions/buy', { fundId: Number(id), amount: Number(buyAmount) });
      setMessage({ type: 'success', text: res.data.message });
      setBuyAmount('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Purchase failed' });
    }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  if (!fund) return null;

  const formatPercent = (val) => val ? `${(Number(val) * 100).toFixed(2)}%` : 'N/A';

  return (
    <div className="page-container" id="fund-detail-page">
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/funds')} style={{ marginBottom: '1rem' }}>
        ← Back to Funds
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Main Content */}
        <div>
          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>{fund.fundName}</h1>
                <span className="fund-ticker" style={{ fontSize: '0.9rem' }}>{fund.tickerSymbol}</span>
                <span className={`fund-category category-${fund.category}`} style={{ marginLeft: '0.75rem' }}>{fund.category}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-success)' }}>₹{Number(fund.currentNav).toFixed(2)}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Current NAV</div>
              </div>
            </div>

            {fund.description && (
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1rem' }}>{fund.description}</p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Fund Manager</span><br /><strong>{fund.fundManager}</strong></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Expense Ratio</span><br /><strong>{fund.expenseRatio}%</strong></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Risk Rating</span><br /><strong>{fund.riskRating}/5</strong></div>
            </div>
          </div>

          {/* Analytics */}
          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>📊 Performance Analytics</h3>
            <div className="grid-4">
              <div className="stat-card">
                <div className="stat-label">CAGR</div>
                <div className="stat-value" style={{ fontSize: '1.2rem', color: Number(fund.cagr) >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                  {formatPercent(fund.cagr)}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Sharpe Ratio</div>
                <div className="stat-value" style={{ fontSize: '1.2rem' }}>{fund.sharpeRatio ? Number(fund.sharpeRatio).toFixed(3) : 'N/A'}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Std Deviation</div>
                <div className="stat-value" style={{ fontSize: '1.2rem' }}>{formatPercent(fund.standardDeviation)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">1Y Return</div>
                <div className="stat-value" style={{ fontSize: '1.2rem', color: Number(fund.oneYearReturn) >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                  {formatPercent(fund.oneYearReturn)}
                </div>
              </div>
            </div>
          </div>

          {/* NAV Chart */}
          {fund.navHistory && fund.navHistory.length > 0 && (
            <div className="glass-card chart-container">
              <h3 style={{ marginBottom: '1rem' }}>📈 NAV History (1 Year)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={fund.navHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(d) => d.slice(5)} interval={30} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9' }} />
                  <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Sidebar — Buy Panel */}
        {hasRole('INVESTOR') && (
          <div className="glass-card" style={{ position: 'sticky', top: '80px' }}>
            <h3 style={{ marginBottom: '1rem' }}>💰 Invest in this Fund</h3>

            {message.text && (
              <div className={message.type === 'success' ? 'success-message' : 'error-message'}>{message.text}</div>
            )}

            <div className="form-group">
              <label htmlFor="buy-amount">Investment Amount (₹)</label>
              <input id="buy-amount" type="number" className="form-control" placeholder="Enter amount"
                value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)} min="1" />
            </div>

            {buyAmount && Number(buyAmount) > 0 && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                ≈ {(Number(buyAmount) / Number(fund.currentNav)).toFixed(4)} units at ₹{Number(fund.currentNav).toFixed(2)}/unit
              </p>
            )}

            <button className="btn btn-success btn-lg" style={{ width: '100%' }} onClick={handleBuy}
              disabled={!buyAmount || Number(buyAmount) <= 0}>
              Buy Now
            </button>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.75rem', textAlign: 'center' }}>
              Min Investment: ₹{fund.minInvestment ? Number(fund.minInvestment).toLocaleString() : '—'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
