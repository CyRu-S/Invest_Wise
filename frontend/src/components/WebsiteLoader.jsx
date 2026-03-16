import { useState, useEffect } from 'react';

// Finance-themed SVG icons for the scatter animation
const icons = [
  // Bar chart
  <svg key="chart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>,
  // Trending up
  <svg key="trend" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  // Shield/checkmark
  <svg key="shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  // Wallet
  <svg key="wallet" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="5" width="22" height="16" rx="2"/><path d="M1 10h22"/><circle cx="18" cy="15" r="1"/></svg>,
  // Diamond/gem
  <svg key="gem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 18 3 22 9 12 22 2 9"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="12" y1="22" x2="8" y2="9"/><line x1="12" y1="22" x2="16" y2="9"/><line x1="8" y1="9" x2="10" y2="3"/><line x1="16" y1="9" x2="14" y2="3"/></svg>,
  // Pie chart
  <svg key="pie" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
  // Coins / dollar
  <svg key="dollar" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  // Lock
  <svg key="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  // Target
  <svg key="target" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  // Checkmark square
  <svg key="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="m9 12 2 2 4-4"/></svg>,
  // Lightning bolt
  <svg key="bolt" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  // Star
  <svg key="star" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
];

// Scattered positions for each icon (percentage-based)
const scatterPositions = [
  { x: -35, y: -40, rotate: 45, scale: 0.9 },
  { x: 30, y: -35, rotate: -30, scale: 1.1 },
  { x: -40, y: 15, rotate: 60, scale: 0.8 },
  { x: 35, y: 20, rotate: -45, scale: 1.0 },
  { x: -20, y: -45, rotate: 20, scale: 1.2 },
  { x: 40, y: -10, rotate: -60, scale: 0.7 },
  { x: -30, y: 35, rotate: 35, scale: 1.0 },
  { x: 25, y: 40, rotate: -20, scale: 0.9 },
  { x: 0, y: -42, rotate: 15, scale: 1.1 },
  { x: -42, y: -5, rotate: -40, scale: 0.8 },
  { x: 42, y: 30, rotate: 50, scale: 1.0 },
  { x: 5, y: 42, rotate: -15, scale: 0.9 },
];

export default function WebsiteLoader({ onFinished }) {
  const [phase, setPhase] = useState('scatter'); // scatter → converge → logo → text → done
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Phase timing
    const timers = [
      setTimeout(() => setPhase('converge'), 600),
      setTimeout(() => setPhase('logo'), 2000),
      setTimeout(() => setPhase('text'), 2600),
      setTimeout(() => setPhase('fadeout'), 3600),
      setTimeout(() => {
        setVisible(false);
        onFinished?.();
      }, 4200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onFinished]);

  if (!visible) return null;

  return (
    <div
      className={`website-loader ${phase === 'fadeout' ? 'loader-fadeout' : ''}`}
    >
      <style>{`
        .website-loader {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #1a0a2e;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.6s ease-out;
        }
        .loader-fadeout {
          opacity: 0;
          pointer-events: none;
        }

        .loader-stage {
          position: relative;
          width: 400px;
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* === Scatter Phase: Icons appear scattered === */
        .scatter-icon {
          position: absolute;
          width: 36px;
          height: 36px;
          color: rgba(163, 130, 255, 0.7);
          opacity: 0;
          animation: iconAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.3));
        }

        @keyframes iconAppear {
          0% {
            opacity: 0;
            transform: var(--scatter-transform) scale(0);
          }
          100% {
            opacity: 1;
            transform: var(--scatter-transform);
          }
        }

        /* === Converge Phase: Icons move to center === */
        .scatter-icon.converging {
          animation: iconConverge 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes iconConverge {
          0% {
            opacity: 1;
            transform: var(--scatter-transform);
          }
          70% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg) scale(0.5);
          }
          85% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg) scale(0.6);
          }
          100% {
            opacity: 0;
            transform: translate(0, 0) rotate(0deg) scale(0);
          }
        }

        /* === Logo Phase === */
        .logo-container {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          opacity: 0;
          transform: scale(0.5);
        }

        .logo-container.logo-visible {
          animation: logoReveal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes logoReveal {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          60% {
            opacity: 1;
            transform: scale(1.08);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .logo-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #6366f1, #a78bfa, #c084fc);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px rgba(99, 102, 241, 0.4), 0 0 60px rgba(139, 92, 246, 0.2);
          flex-shrink: 0;
        }

        .logo-icon svg {
          width: 32px;
          height: 32px;
          color: white;
        }

        /* === Text Reveal Phase === */
        .brand-text {
          display: flex;
          gap: 0;
          overflow: hidden;
        }

        .brand-letter {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 2.8rem;
          font-weight: 800;
          background: linear-gradient(135deg, #c4b5fd 0%, #e9d5ff 50%, #ffffff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: 0;
          transform: translateY(20px);
          letter-spacing: -0.02em;
        }

        .brand-letter.letter-visible {
          animation: letterReveal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes letterReveal {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Subtle background glow pulse */
        .loader-bg-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 40%, transparent 70%);
          animation: glowPulse 2s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes glowPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.3); opacity: 1; }
        }

        /* Particle sparkles */
        .loader-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(163, 130, 255, 0.6);
          animation: particleFloat 3s ease-in-out infinite;
        }

        @keyframes particleFloat {
          0%, 100% { transform: var(--particle-start); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: var(--particle-end); opacity: 0; }
        }
      `}</style>

      {/* Background glow */}
      <div className="loader-bg-glow" />

      {/* Floating particles */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const r1 = 60 + Math.random() * 40;
        const r2 = r1 + 30 + Math.random() * 30;
        return (
          <div
            key={`p-${i}`}
            className="loader-particle"
            style={{
              '--particle-start': `translate(${Math.cos(angle) * r1}px, ${Math.sin(angle) * r1}px)`,
              '--particle-end': `translate(${Math.cos(angle) * r2}px, ${Math.sin(angle) * r2}px)`,
              animationDelay: `${i * 0.3}s`,
              width: `${2 + Math.random() * 2}px`,
              height: `${2 + Math.random() * 2}px`,
            }}
          />
        );
      })}

      {/* Main animation stage */}
      <div className="loader-stage">
        {/* Scattered icons */}
        {icons.map((icon, i) => {
          const pos = scatterPositions[i];
          const tx = pos.x * 4; // scale to pixels
          const ty = pos.y * 4;
          const scatterTransform = `translate(${tx}px, ${ty}px) rotate(${pos.rotate}deg) scale(${pos.scale})`;
          const delay = i * 0.04;

          return (
            <div
              key={`icon-${i}`}
              className={`scatter-icon ${phase === 'converge' || phase === 'logo' || phase === 'text' || phase === 'fadeout' ? 'converging' : ''}`}
              style={{
                '--scatter-transform': scatterTransform,
                animationDelay: phase === 'scatter' ? `${delay}s` : `${delay * 0.5}s`,
              }}
            >
              {icon}
            </div>
          );
        })}

        {/* Logo + Text (shown in logo/text phase) */}
        <div className={`logo-container ${phase === 'logo' || phase === 'text' || phase === 'fadeout' ? 'logo-visible' : ''}`}>
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="6 3 18 3 22 9 12 22 2 9" />
              <line x1="2" y1="9" x2="22" y2="9" />
              <line x1="12" y1="22" x2="8" y2="9" />
              <line x1="12" y1="22" x2="16" y2="9" />
              <line x1="8" y1="9" x2="10" y2="3" />
              <line x1="16" y1="9" x2="14" y2="3" />
            </svg>
          </div>
          <div className="brand-text">
            {'InvestWise'.split('').map((letter, i) => (
              <span
                key={`letter-${i}`}
                className={`brand-letter ${phase === 'text' || phase === 'fadeout' ? 'letter-visible' : ''}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
