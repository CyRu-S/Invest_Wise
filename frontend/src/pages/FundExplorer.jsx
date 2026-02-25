import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function RiskStars({ rating }) {
  return (
    <div className="risk-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className={`risk-star ${i <= rating ? 'filled' : 'empty'}`} />
      ))}
    </div>
  );
}

export default function FundExplorer() {
  const [funds, setFunds] = useState([]);
  const [category, setCategory] = useState('');
  const [maxRisk, setMaxRisk] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFunds = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category) params.category = category;
      if (maxRisk) params.maxRisk = maxRisk;
      const res = await api.get('/funds/public', { params });
      setFunds(res.data);
    } catch (err) {
      console.error('Failed to fetch funds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFunds(); }, [category, maxRisk]);

  const filtered = funds.filter(f =>
    f.fundName.toLowerCase().includes(search.toLowerCase()) ||
    f.tickerSymbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container" id="fund-explorer-page">
      <div className="page-header">
        <h1>Mutual Fund Explorer</h1>
        <p>Discover funds matched to your risk profile and investment goals</p>
      </div>

      <div className="filter-bar">
        <input type="text" className="form-control search-input" placeholder="🔍 Search funds..."
          value={search} onChange={(e) => setSearch(e.target.value)} id="fund-search" />

        <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)} id="category-filter">
          <option value="">All Categories</option>
          <option value="EQUITY">Equity</option>
          <option value="DEBT">Debt</option>
          <option value="HYBRID">Hybrid</option>
          <option value="ELSS">ELSS</option>
        </select>

        <select className="form-control" value={maxRisk} onChange={(e) => setMaxRisk(e.target.value)} id="risk-filter">
          <option value="">All Risk Levels</option>
          <option value="1">Low (1)</option>
          <option value="2">Low-Med (≤2)</option>
          <option value="3">Medium (≤3)</option>
          <option value="4">Med-High (≤4)</option>
          <option value="5">All (≤5)</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No funds match your criteria</p>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(fund => (
            <Link to={`/funds/${fund.id}`} key={fund.id} className="glass-card fund-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div className="fund-name">{fund.fundName}</div>
                  <div className="fund-ticker">{fund.tickerSymbol}</div>
                </div>
                <span className={`fund-category category-${fund.category}`}>{fund.category}</span>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                {fund.fundManager} · Expense: {fund.expenseRatio}%
              </p>

              <RiskStars rating={fund.riskRating} />

              <div className="fund-meta">
                <span className="fund-nav">₹{Number(fund.currentNav).toFixed(2)}</span>
                {fund.minInvestment && (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Min: ₹{Number(fund.minInvestment).toLocaleString()}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
