import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const questions = [
  {
    q: "What is your primary investment goal?",
    options: [
      { text: "Preserve my capital — I can't afford losses", value: 1 },
      { text: "Stable income with minimal risk", value: 2 },
      { text: "Balanced growth and income", value: 3 },
      { text: "Aggressive growth, I can handle volatility", value: 4 },
      { text: "Maximum returns — I'm comfortable with high risk", value: 5 }
    ]
  },
  {
    q: "What is your investment time horizon?",
    options: [
      { text: "Less than 1 year", value: 1 },
      { text: "1–3 years", value: 2 },
      { text: "3–5 years", value: 3 },
      { text: "5–10 years", value: 4 },
      { text: "More than 10 years", value: 5 }
    ]
  },
  {
    q: "How would you react if your portfolio dropped 20% in one month?",
    options: [
      { text: "Sell everything immediately", value: 1 },
      { text: "Sell some investments to reduce losses", value: 2 },
      { text: "Hold and wait for recovery", value: 3 },
      { text: "Buy more — it's a discount opportunity", value: 4 },
      { text: "Aggressively buy more at lower prices", value: 5 }
    ]
  },
  {
    q: "What percentage of your monthly income can you invest?",
    options: [
      { text: "Less than 5%", value: 1 },
      { text: "5–10%", value: 2 },
      { text: "10–20%", value: 3 },
      { text: "20–30%", value: 4 },
      { text: "More than 30%", value: 5 }
    ]
  },
  {
    q: "How familiar are you with financial markets?",
    options: [
      { text: "Complete beginner — I know very little", value: 1 },
      { text: "Basic understanding of stocks and bonds", value: 2 },
      { text: "Moderate — I follow market news regularly", value: 3 },
      { text: "Advanced — I understand derivatives and ratios", value: 4 },
      { text: "Expert — I actively trade and analyze markets", value: 5 }
    ]
  }
];

export default function RiskProfiler() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (value) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      submitQuestionnaire(newAnswers);
    }
  };

  const submitQuestionnaire = async (ans) => {
    setLoading(true);
    try {
      const res = await api.post('/investor/risk-profile', { answers: ans });
      setResult(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (cat) => {
    if (cat === 'CONSERVATIVE') return 'var(--accent-success)';
    if (cat === 'MODERATE') return 'var(--accent-warning)';
    return 'var(--accent-danger)';
  };

  const getCategoryEmoji = (cat) => {
    if (cat === 'CONSERVATIVE') return '🛡️';
    if (cat === 'MODERATE') return '⚖️';
    return '🚀';
  };

  if (result) {
    return (
      <div className="page-container" id="risk-result-page">
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div className="glass-card" style={{ padding: '3rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{getCategoryEmoji(result.category)}</div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Your Risk Profile</h1>

            <div style={{ fontSize: '3rem', fontWeight: 800, color: getCategoryColor(result.category), margin: '1rem 0' }}>
              {result.category}
            </div>

            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Your risk tolerance score: <strong>{result.score}/100</strong>
            </p>

            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: `${result.score}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, var(--accent-success), ${getCategoryColor(result.category)})`,
                  borderRadius: 4,
                  transition: 'width 1s ease'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Conservative</span><span>Moderate</span><span>Aggressive</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/funds')}>
                Explore Matching Funds →
              </button>
              <button className="btn btn-ghost" onClick={() => { setStep(0); setAnswers([]); setResult(null); }}>
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  }

  return (
    <div className="page-container" id="risk-profiler-page">
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1>🧠 Investment Risk Profiler</h1>
          <p>Answer {questions.length} questions to discover your investment personality</p>
        </div>

        {/* Progress */}
        <div className="profiler-progress">
          {questions.map((_, i) => (
            <div key={i} className={`step ${i < step ? 'done' : ''} ${i === step ? 'active' : ''}`} />
          ))}
        </div>

        {/* Question */}
        <div className="glass-card question-card" key={step}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            Question {step + 1} of {questions.length}
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {questions[step].q}
          </h2>

          <div className="option-grid">
            {questions[step].options.map((opt, i) => (
              <button key={i} className="option-btn" onClick={() => handleSelect(opt.value)}>
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
