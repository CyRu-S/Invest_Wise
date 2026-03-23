import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Compass,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import './AdvisorRiskPages.css';
import api from '../services/api';

const questions = [
  {
    q: 'What is your primary investment goal?',
    options: [
      { text: "Preserve my capital - I can't afford losses", value: 1 },
      { text: 'Stable income with minimal risk', value: 2 },
      { text: 'Balanced growth and income', value: 3 },
      { text: 'Aggressive growth, I can handle volatility', value: 4 },
      { text: "Maximum returns - I'm comfortable with high risk", value: 5 },
    ],
  },
  {
    q: 'What is your investment time horizon?',
    options: [
      { text: 'Less than 1 year', value: 1 },
      { text: '1-3 years', value: 2 },
      { text: '3-5 years', value: 3 },
      { text: '5-10 years', value: 4 },
      { text: 'More than 10 years', value: 5 },
    ],
  },
  {
    q: 'How would you react if your portfolio dropped 20% in one month?',
    options: [
      { text: 'Sell everything immediately', value: 1 },
      { text: 'Sell some investments to reduce losses', value: 2 },
      { text: 'Hold and wait for recovery', value: 3 },
      { text: "Buy more - it's a discount opportunity", value: 4 },
      { text: 'Aggressively buy more at lower prices', value: 5 },
    ],
  },
  {
    q: 'What percentage of your monthly income can you invest?',
    options: [
      { text: 'Less than 5%', value: 1 },
      { text: '5-10%', value: 2 },
      { text: '10-20%', value: 3 },
      { text: '20-30%', value: 4 },
      { text: 'More than 30%', value: 5 },
    ],
  },
  {
    q: 'How familiar are you with financial markets?',
    options: [
      { text: 'Complete beginner - I know very little', value: 1 },
      { text: 'Basic understanding of stocks and bonds', value: 2 },
      { text: 'Moderate - I follow market news regularly', value: 3 },
      { text: 'Advanced - I understand derivatives and ratios', value: 4 },
      { text: 'Expert - I actively trade and analyze markets', value: 5 },
    ],
  },
];

function getRiskMeta(category) {
  if (category === 'CONSERVATIVE') {
    return {
      tone: 'conservative',
      title: 'Capital protection first',
      summary: 'A steadier allocation profile with lower drawdown tolerance suits you best.',
    };
  }

  if (category === 'MODERATE') {
    return {
      tone: 'moderate',
      title: 'Balanced growth profile',
      summary: 'You can absorb some volatility while still preferring a measured investment path.',
    };
  }

  return {
    tone: 'aggressive',
    title: 'Growth-led risk appetite',
    summary: 'You are comfortable taking on stronger market swings in pursuit of higher returns.',
  };
}

export default function RiskProfiler() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (value) => {
    const nextAnswers = [...answers];
    nextAnswers[step] = value;
    setAnswers(nextAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
      return;
    }

    submitQuestionnaire(nextAnswers);
  };

  const handleBack = () => {
    if (step === 0) return;
    setStep(step - 1);
  };

  const submitQuestionnaire = async (submittedAnswers) => {
    setLoading(true);

    try {
      const response = await api.post('/investor/risk-profile', { answers: submittedAnswers });
      setResult(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const restartProfiler = () => {
    setStep(0);
    setAnswers([]);
    setResult(null);
  };

  const answeredCount = answers.filter((answer) => answer !== undefined).length;
  const progressPercent = ((step + (result ? 1 : 0)) / questions.length) * 100;

  if (loading) {
    return (
      <div className="page-container insight-page">
        <div className="insight-loading-shell">
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    const riskMeta = getRiskMeta(result.category);

    return (
      <div className="page-container insight-page risk-profiler-page" id="risk-result-page">
        

        <section className="insight-hero">
          <div className="insight-hero__copy">
            <span className="insight-hero__kicker">
              <ShieldCheck size={16} />
              Risk Profile Ready
            </span>
            <h1>{riskMeta.title}</h1>
            <p>{riskMeta.summary}</p>
            <div className="insight-hero__chips">
              <span className={`insight-chip insight-chip--${riskMeta.tone}`}>{result.category}</span>
              <span className="insight-chip">Score {result.score}/100</span>
            </div>
          </div>

          <div className="insight-hero__summary">
            <div className={`insight-hero__stat insight-hero__stat--${riskMeta.tone}`}>
              <span>Risk category</span>
              <strong>{result.category}</strong>
            </div>
            <div className={`insight-hero__stat insight-hero__stat--${riskMeta.tone}`}>
              <span>Score</span>
              <strong>{result.score}/100</strong>
            </div>
            <div className={`insight-hero__stat insight-hero__stat--${riskMeta.tone}`}>
              <span>Interpretation</span>
              <strong>{riskMeta.title}</strong>
            </div>
            <div className={`insight-hero__stat insight-hero__stat--${riskMeta.tone}`}>
              <span>Next move</span>
              <strong>Explore matching funds</strong>
            </div>
          </div>
        </section>

        <section className="risk-result-panel">
          <div className="risk-result-panel__meter">
            <div className="risk-result-panel__meter-bar">
              <div className={`risk-result-panel__meter-fill risk-result-panel__meter-fill--${riskMeta.tone}`} style={{ width: `${result.score}%` }} />
            </div>
            <div className="risk-result-panel__meter-labels">
              <span>Conservative</span>
              <span>Moderate</span>
              <span>Aggressive</span>
            </div>
          </div>

          <div className="risk-result-panel__actions">
            <button className="btn btn-primary" onClick={() => navigate('/funds')}>
              Explore Matching Funds
              <ArrowRight size={16} />
            </button>
            <button className="btn btn-ghost" onClick={restartProfiler}>
              <RotateCcw size={16} />
              Retake Profile
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-container insight-page risk-profiler-page" id="risk-profiler-page">

      <section className="insight-hero">
        <div className="insight-hero__copy">
          <span className="insight-hero__kicker">
            <Brain size={16} />
            Investment Risk Profiler
          </span>
          <h1>Answer five questions and uncover your real investing comfort zone.</h1>
          <p>
            This flow translates your goals, time horizon, and volatility tolerance into a risk
            profile you can immediately use inside the fund explorer.
          </p>
          <div className="insight-hero__chips">
            <span className="insight-chip">5 questions</span>
            <span className="insight-chip">1-2 minutes</span>
          </div>
        </div>

        <div className="insight-hero__summary">
          <div className="insight-hero__stat insight-hero__stat--indigo">
            <span>Current question</span>
            <strong>{step + 1}</strong>
          </div>
          <div className="insight-hero__stat insight-hero__stat--indigo">
            <span>Answered</span>
            <strong>{answeredCount}/{questions.length}</strong>
          </div>
          <div className="insight-hero__stat insight-hero__stat--indigo">
            <span>Progress</span>
            <strong>{Math.round(progressPercent)}%</strong>
          </div>
          <div className="insight-hero__stat insight-hero__stat--indigo">
            <span>Outcome</span>
            <strong>Risk profile</strong>
          </div>
        </div>
      </section>

      <section className="risk-profiler-layout">
        <div className="risk-question-card">
          <div className="risk-question-card__top">
            <span className="risk-question-card__label">
              Question {step + 1} of {questions.length}
            </span>
            <div className="risk-question-card__progress">
              {questions.map((_, index) => (
                <span
                  key={index}
                  className={`risk-question-card__progress-step ${index < step ? 'is-complete' : ''} ${index === step ? 'is-active' : ''}`}
                />
              ))}
            </div>
          </div>

          <h2>{questions[step].q}</h2>

          <div className="risk-option-list">
            {questions[step].options.map((option, index) => (
              <button key={index} className="risk-option" onClick={() => handleSelect(option.value)}>
                <span className="risk-option__index">{String(index + 1).padStart(2, '0')}</span>
                <span className="risk-option__text">{option.text}</span>
              </button>
            ))}
          </div>

          {step > 0 && (
            <button className="btn btn-ghost risk-question-card__back" onClick={handleBack}>
              <ArrowLeft size={16} />
              Previous Question
            </button>
          )}
        </div>

        <aside className="risk-side-panel">
          <div className="risk-side-panel__item">
            <Compass size={18} />
            <div>
              <strong>Goal-oriented profiling</strong>
              <p>Every answer moves you closer to an allocation style that fits your real comfort level.</p>
            </div>
          </div>
          <div className="risk-side-panel__item">
            <Target size={18} />
            <div>
              <strong>Actionable result</strong>
              <p>Your final score is sent directly to your investor profile and can guide fund discovery instantly.</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
