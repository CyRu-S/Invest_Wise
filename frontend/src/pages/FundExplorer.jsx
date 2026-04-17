import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Layers3,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { MagicBentoCard, MagicBentoGrid } from '../components/MagicBentoGrid';
import './FundPages.css';
import api from '../services/api';
import { readSessionCache, sessionCacheKeys, writeSessionCache } from '../services/sessionCache';

const PUBLIC_FUNDS_TTL_MS = 5 * 60 * 1000;

function formatCurrency(value, fallback = 'N/A') {
  if (value === null || value === undefined || value === '') return fallback;
  return `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function formatReturn(value) {
  if (value === null || value === undefined || value === '') return 'N/A';
  return `${(Number(value) * 100).toFixed(2)}%`;
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

export default function FundExplorer() {
  const [funds, setFunds] = useState([]);
  const [category, setCategory] = useState('');
  const [maxRisk, setMaxRisk] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const fetchFunds = async () => {
      const params = {};
      if (category) params.category = category;
      if (maxRisk) params.maxRisk = maxRisk;

      const cacheKey = sessionCacheKeys.publicFunds(params);
      const cachedFunds = readSessionCache(cacheKey, { ttlMs: PUBLIC_FUNDS_TTL_MS });

      if (cachedFunds) {
        setFunds(cachedFunds);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get('/funds/public', { params });
        if (!isActive) return;
        setFunds(response.data);
        writeSessionCache(cacheKey, response.data);
      } catch (error) {
        console.error('Failed to fetch funds:', error);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchFunds();

    return () => {
      isActive = false;
    };
  }, [category, maxRisk]);

  const filteredFunds = funds.filter((fund) => {
    const query = search.toLowerCase();
    return (
      fund.fundName.toLowerCase().includes(query) ||
      fund.tickerSymbol.toLowerCase().includes(query)
    );
  });

  const categoryCount = new Set(filteredFunds.map((fund) => fund.category).filter(Boolean)).size;
  const averageOneYearReturn = filteredFunds.length
    ? filteredFunds.reduce((sum, fund) => sum + Number(fund.oneYearReturn || 0), 0) / filteredFunds.length
    : null;
  const lowestInvestment = filteredFunds.reduce((lowest, fund) => {
    const investment = Number(fund.minInvestment || 0);
    if (!investment) return lowest;
    if (!lowest) return investment;
    return Math.min(lowest, investment);
  }, 0);
  const topPerformer = filteredFunds.reduce((best, fund) => {
    if (!best) return fund;
    return Number(fund.oneYearReturn || 0) > Number(best.oneYearReturn || 0) ? fund : best;
  }, null);

  return (
    <div className="page-container fund-page fund-page--explorer" id="fund-explorer-page">
      <section className="fund-hero">
        <div className="fund-hero__copy">
          <span className="fund-kicker">
            <Sparkles size={16} />
            Fund Discovery
          </span>
          <h1>Explore funds in a richer, faster way.</h1>
          <p>
            Scan performance, risk, expense, and entry points in one view, then dive into the
            funds that best fit your allocation style.
          </p>
          <div className="fund-hero__chips">
            <span className="fund-chip">
              <Layers3 size={14} />
              {filteredFunds.length} live matches
            </span>
            <span className="fund-chip">
              <ShieldCheck size={14} />
              Filter by risk and category
            </span>
          </div>
        </div>

        <div className="fund-hero__rail">
          <div className="fund-hero__stat fund-hero__stat--spotlight">
            <span className="fund-hero__stat-label">Average 1Y return</span>
            <strong>{averageOneYearReturn !== null ? formatReturn(averageOneYearReturn) : 'N/A'}</strong>
          </div>
          <div className="fund-hero__stat fund-hero__stat--spotlight">
            <span className="fund-hero__stat-label">Lowest entry point</span>
            <strong>{lowestInvestment ? formatCurrency(lowestInvestment) : 'Flexible'}</strong>
          </div>
          <div className="fund-hero__stat fund-hero__stat--spotlight">
            <span className="fund-hero__stat-label">Categories visible</span>
            <strong>{categoryCount || 0}</strong>
          </div>
          <div className="fund-hero__stat fund-hero__stat--spotlight">
            <span className="fund-hero__stat-label">Top momentum</span>
            <strong>{topPerformer ? topPerformer.tickerSymbol : 'Waiting for data'}</strong>
            <span className="fund-hero__stat-note">
              {topPerformer ? formatReturn(topPerformer.oneYearReturn) : 'No standout yet'}
            </span>
          </div>
        </div>
      </section>

      <section className="fund-toolbar" aria-label="Fund filters">
        <label className="fund-field fund-field--search" htmlFor="fund-search">
          <Search size={18} />
          <input
            id="fund-search"
            type="text"
            className="fund-field__input"
            placeholder="Search by fund name or ticker"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <label className="fund-field fund-field--select" htmlFor="category-filter">
          <span className="fund-field__label">
            <Layers3 size={16} />
            Category
          </span>
          <select
            id="category-filter"
            className="fund-field__select"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All Categories</option>
            <option value="EQUITY">Equity</option>
            <option value="DEBT">Debt</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ELSS">ELSS</option>
          </select>
        </label>

        <label className="fund-field fund-field--select" htmlFor="risk-filter">
          <span className="fund-field__label">
            <SlidersHorizontal size={16} />
            Max risk
          </span>
          <select
            id="risk-filter"
            className="fund-field__select"
            value={maxRisk}
            onChange={(event) => setMaxRisk(event.target.value)}
          >
            <option value="">All Risk Levels</option>
            <option value="1">Low (1)</option>
            <option value="2">Low-Med (≤2)</option>
            <option value="3">Medium (≤3)</option>
            <option value="4">Med-High (≤4)</option>
            <option value="5">All (≤5)</option>
          </select>
        </label>
      </section>

      {loading ? (
        <div className="loading-spinner fund-loading-shell">
          <div className="spinner" />
        </div>
      ) : filteredFunds.length === 0 ? (
        <div className="fund-empty-state">
          <h2>No funds match these filters</h2>
          <p>Try widening the risk range, changing the category, or searching with a shorter keyword.</p>
        </div>
      ) : (
        <>
          <div className="fund-section-head">
            <div>
              <span className="fund-section-head__eyebrow">Curated list</span>
              <h2>Browse the shortlist visually</h2>
            </div>
          </div>

          <MagicBentoGrid className="fund-explorer-grid" pattern="uniform">
            {filteredFunds.map((fund) => {
              return (
                <MagicBentoCard
                  as={Link}
                  to={`/funds/${fund.id}`}
                  key={fund.id}
                  className={`fund-bento-card fund-bento-card--${fund.category}`}
                >
                  <div className="fund-bento-card__top">
                    <span className={`fund-pill fund-pill--${fund.category}`}>{fund.category}</span>
                    <span className="fund-bento-card__arrow" aria-hidden="true">
                      <ArrowRight size={16} />
                    </span>
                  </div>

                  <div className="fund-bento-card__main">
                    <div className="fund-bento-card__title-block">
                      <p className="fund-bento-card__ticker">{fund.tickerSymbol}</p>
                      <h3>{fund.fundName}</h3>
                      <p className="fund-bento-card__manager">{fund.fundManager || 'Managed by the house team'}</p>
                    </div>

                    <div className="fund-bento-card__scoreboard">
                      <div className="fund-bento-card__metric">
                        <span className="fund-bento-card__metric-label">
                          <Wallet size={14} />
                          NAV
                        </span>
                        <strong>{formatCurrency(fund.currentNav)}</strong>
                      </div>
                      <div className="fund-bento-card__metric">
                        <span className="fund-bento-card__metric-label">
                          <TrendingUp size={14} />
                          1Y return
                        </span>
                        <strong className={Number(fund.oneYearReturn) >= 0 ? 'is-positive' : 'is-negative'}>
                          {formatReturn(fund.oneYearReturn)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="fund-bento-card__bottom">
                    <div className="fund-bento-card__risk">
                      <div>
                        <span className="fund-bento-card__caption">Risk band</span>
                        <strong>{getRiskLabel(Number(fund.riskRating || 0))}</strong>
                      </div>
                      <RiskMeter rating={Number(fund.riskRating || 0)} />
                    </div>

                    <div className="fund-bento-card__meta">
                      <span>Expense {Number(fund.expenseRatio || 0).toFixed(2)}%</span>
                      <span>Min {formatCurrency(fund.minInvestment, 'Flexible')}</span>
                    </div>
                  </div>
                </MagicBentoCard>
              );
            })}
          </MagicBentoGrid>
        </>
      )}
    </div>
  );
}
