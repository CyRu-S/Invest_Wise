import { useState, useEffect, useMemo } from 'react';

// Finance-themed SVG icons for the scatter → converge animation
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

// Scattered positions (percentage-based, outside the circle)
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
  // Phases: scatter → converge → logo → brand → fadeout → done
  const [phase, setPhase] = useState('scatter');
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  // Precompute particle geometry once
  const particles = useMemo(() => {
    const count = 10;
    const seed = 1337;
    let t = seed;
    const rand = () => {
      t ^= t << 13;
      t ^= t >> 17;
      t ^= t << 5;
      return ((t >>> 0) % 10_000) / 10_000;
    };

    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const r1 = 56 + rand() * 44;
      const r2 = r1 + 30 + rand() * 40;
      const size = 2 + rand() * 2.2;
      return {
        key: `p-${i}`,
        start: `translate(${Math.cos(angle) * r1}px, ${Math.sin(angle) * r1}px)`,
        end: `translate(${Math.cos(angle) * r2}px, ${Math.sin(angle) * r2}px)`,
        delay: `${i * 0.24}s`,
        w: `${size}px`,
        h: `${size}px`,
      };
    });
  }, []);

  useEffect(() => {
    const timers = [
      // Progress steps
      setTimeout(() => setProgress(20), 200),
      setTimeout(() => setProgress(40), 700),
      // Icons converge into center
      setTimeout(() => { setPhase('converge'); setProgress(55); }, 900),
      // Favicon appears
      setTimeout(() => { setPhase('logo'); setProgress(70); }, 2000),
      // Brand text + loading bar
      setTimeout(() => { setPhase('brand'); setProgress(85); }, 2600),
      // Almost done
      setTimeout(() => setProgress(100), 3300),
      // Fade out
      setTimeout(() => setPhase('fadeout'), 3600),
      setTimeout(() => {
        setVisible(false);
        onFinished?.();
      }, 4300),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onFinished]);

  if (!visible) return null;

  const isConverging = phase === 'converge' || phase === 'logo' || phase === 'brand' || phase === 'fadeout';
  const showLogo = phase === 'logo' || phase === 'brand' || phase === 'fadeout';
  const showBrand = phase === 'brand' || phase === 'fadeout';

  return (
    <div className={`website-loader ${phase === 'fadeout' ? 'loader-fadeout' : ''}`}>
      <style>{`
        .website-loader {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.65s ease-out;
          background:
            radial-gradient(900px circle at 20% 22%, rgba(99, 102, 241, 0.16), transparent 55%),
            radial-gradient(800px circle at 80% 66%, rgba(139, 92, 246, 0.14), transparent 56%),
            radial-gradient(700px circle at 50% 50%, rgba(192, 132, 252, 0.08), transparent 60%),
            #0a0e1a;
          overflow: hidden;
          isolation: isolate;
        }

        /* Background SVG layer */
        .loader-bg-svg {
          position: absolute;
          inset: 0;
          background-image: url('/background.svg');
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center;
          opacity: 0.15;
          mix-blend-mode: screen;
          pointer-events: none;
          z-index: 0;
        }

        .loader-bg-svg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 40%, rgba(10, 14, 26, 0.0) 0%, rgba(10, 14, 26, 0.55) 55%, rgba(10, 14, 26, 0.88) 100%);
        }

        .website-loader::before {
          content: '';
          position: absolute;
          inset: -35%;
          background:
            conic-gradient(from 180deg at 50% 50%,
              rgba(99, 102, 241, 0.12),
              rgba(139, 92, 246, 0.10),
              rgba(192, 132, 252, 0.08),
              rgba(99, 102, 241, 0.12)
            );
          filter: blur(60px);
          opacity: 0.55;
          animation: loaderAurora 10s ease-in-out infinite alternate;
          z-index: 0;
        }

        @keyframes loaderAurora {
          0% { transform: translate(-4%, -6%) rotate(0deg) scale(1); }
          100% { transform: translate(5%, 7%) rotate(26deg) scale(1.06); }
        }

        .loader-fadeout {
          opacity: 0;
          pointer-events: none;
        }

        /* Center stack */
        .loader-center {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }

        /* Glass circle stage */
        .loader-stage {
          position: relative;
          width: min(320px, 78vw);
          height: min(320px, 78vw);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }

        .loader-plate {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(14px) saturate(1.35);
          -webkit-backdrop-filter: blur(14px) saturate(1.35);
          box-shadow:
            0 24px 60px rgba(3, 7, 18, 0.55),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
        }

        .loader-plate::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background:
            radial-gradient(circle at 22% 26%, rgba(255, 255, 255, 0.18), transparent 36%),
            radial-gradient(circle at 70% 62%, rgba(255, 255, 255, 0.10), transparent 44%);
          opacity: 0.8;
          pointer-events: none;
        }

        /* === Scatter Phase: Icons appear scattered outside === */
        .scatter-icon {
          position: absolute;
          width: 34px;
          height: 34px;
          color: rgba(226, 232, 240, 0.62);
          opacity: 0;
          animation: iconAppear 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.18));
        }

        @keyframes iconAppear {
          0% { opacity: 0; transform: var(--scatter-transform) scale(0); }
          100% { opacity: 1; transform: var(--scatter-transform); }
        }

        /* === Converge Phase: Icons move into center === */
        .scatter-icon.converging {
          animation: iconConverge 0.95s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          filter: drop-shadow(0 0 14px rgba(139, 92, 246, 0.25));
        }

        @keyframes iconConverge {
          0% { opacity: 1; transform: var(--scatter-transform); }
          70% { opacity: 1; transform: translate(0, 0) rotate(0deg) scale(0.55); }
          100% { opacity: 0; transform: translate(0, 0) rotate(0deg) scale(0); }
        }

        /* === Favicon reveal after convergence === */
        .loader-favicon-wrap {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.3);
        }

        .loader-favicon-wrap.favicon-visible {
          animation: faviconReveal 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes faviconReveal {
          0% { opacity: 0; transform: scale(0.3); }
          60% { opacity: 1; transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }

        .loader-favicon {
          width: 72px;
          height: 72px;
          filter: drop-shadow(0 0 28px rgba(99, 102, 241, 0.4));
        }

        /* Glow behind favicon */
        .loader-favicon-glow {
          position: absolute;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Background glow pulse behind circle */
        .loader-bg-glow {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, rgba(139, 92, 246, 0.08) 42%, transparent 72%);
          animation: glowPulse 2.4s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }

        @keyframes glowPulse {
          0%, 100% { transform: scale(1); opacity: 0.65; }
          50% { transform: scale(1.34); opacity: 1; }
        }

        /* Particle sparkles */
        .loader-particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(226, 232, 240, 0.42);
          box-shadow: 0 0 14px rgba(139, 92, 246, 0.16);
          animation: particleFloat 3.3s ease-in-out infinite;
          z-index: 1;
        }

        @keyframes particleFloat {
          0%, 100% { transform: var(--particle-start); opacity: 0; }
          18% { opacity: 1; }
          82% { opacity: 1; }
          100% { transform: var(--particle-end); opacity: 0; }
        }

        /* === Brand section below circle === */
        .loader-brand-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          margin-top: 24px;
          opacity: 0;
          transform: translateY(10px);
        }

        .loader-brand-section.brand-visible {
          animation: brandSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes brandSlideUp {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .loader-brand-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .loader-brand-icon {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.25));
        }

        .loader-brand-text {
          display: flex;
          align-items: baseline;
          gap: 0;
          font-family: 'Mulish', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 1.55rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: rgba(226, 232, 240, 0.92);
        }

        .loader-brand-accent {
          color: rgba(167, 139, 250, 0.96);
        }

        /* === Progress bar with stepped fill === */
        .loader-progress {
          width: min(300px, 68vw);
          z-index: 2;
        }

        .loader-progress__track {
          position: relative;
          height: 8px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.10);
          overflow: hidden;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .loader-progress__bar {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          border-radius: inherit;
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.9), rgba(139, 92, 246, 0.85), rgba(192, 132, 252, 0.85));
          box-shadow: 0 0 14px rgba(99, 102, 241, 0.3);
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .loader-progress__bar::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 40px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25));
          border-radius: inherit;
        }

        @media (prefers-reduced-motion: reduce) {
          .loader-progress__bar { transition: none; }
          .website-loader::before,
          .scatter-icon,
          .scatter-icon.converging,
          .loader-favicon-wrap.favicon-visible,
          .loader-brand-section.brand-visible,
          .loader-bg-glow,
          .loader-particle {
            animation: none !important;
            transition: none !important;
          }
          .scatter-icon { opacity: 0.9; }
          .loader-favicon-wrap { opacity: 1; transform: none; }
          .loader-brand-section { opacity: 1; transform: none; }
        }
      `}</style>

      {/* Background SVG */}
      <div className="loader-bg-svg" aria-hidden="true" />

      {/* Background glow */}
      <div className="loader-bg-glow" />

      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.key}
          className="loader-particle"
          style={{
            '--particle-start': p.start,
            '--particle-end': p.end,
            animationDelay: p.delay,
            width: p.w,
            height: p.h,
          }}
        />
      ))}

      <div className="loader-center">
        {/* Glass circle with scatter → converge → favicon */}
        <div className="loader-stage">
          <div className="loader-plate" />

          {/* Finance doodle icons: scattered outside, then converge in */}
          {icons.map((icon, i) => {
            const pos = scatterPositions[i];
            const tx = pos.x * 4;
            const ty = pos.y * 4;
            const scatterTransform = `translate(${tx}px, ${ty}px) rotate(${pos.rotate}deg) scale(${pos.scale})`;
            const delay = i * 0.04;

            return (
              <div
                key={`icon-${i}`}
                className={`scatter-icon ${isConverging ? 'converging' : ''}`}
                style={{
                  '--scatter-transform': scatterTransform,
                  animationDelay: phase === 'scatter' ? `${delay}s` : `${delay * 0.5}s`,
                }}
              >
                {icon}
              </div>
            );
          })}

          {/* Favicon appears after convergence */}
          <div className={`loader-favicon-wrap ${showLogo ? 'favicon-visible' : ''}`}>
            <div className="loader-favicon-glow" />
            <img
              className="loader-favicon"
              src="/favicon.svg"
              alt="InvestWise"
            />
          </div>
        </div>

        {/* Brand + Progress bar below circle */}
        <div className={`loader-brand-section ${showBrand ? 'brand-visible' : ''}`}>
          <div className="loader-brand-row">
            <img className="loader-brand-icon" src="/favicon.svg" alt="" aria-hidden="true" />
            <span className="loader-brand-text">
              <span>Invest</span>
              <span className="loader-brand-accent">Wise</span>
            </span>
          </div>

          <div className="loader-progress" aria-hidden="true">
            <div className="loader-progress__track">
              <div
                className="loader-progress__bar"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
