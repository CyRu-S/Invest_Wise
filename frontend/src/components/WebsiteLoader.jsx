import { useEffect, useMemo, useState } from 'react';

const orbitGlyphs = [
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19h16" />
      <path d="M7 15V9" />
      <path d="M12 15V5" />
      <path d="M17 15v-3" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16 9 11l4 4 7-8" />
      <path d="M16 7h4v4" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 5 7v5c0 4.2 2.6 7.5 7 9 4.4-1.5 7-4.8 7-9V7l-7-4Z" />
      <path d="m9.5 12 1.8 1.8 3.2-3.6" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="13" rx="3" />
      <path d="M3 10h18" />
      <circle cx="17" cy="14.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20" />
      <path d="M16.5 6.5H10a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H7" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a9 9 0 1 0 9 9h-9V3Z" />
      <path d="M21 8.5A9.5 9.5 0 0 0 12.5 0v8.5H21Z" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 20 9l-8 12L4 9l8-6Z" />
      <path d="M4 9h16" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 1.5v4" />
      <path d="M12 18.5v4" />
    </svg>
  ),
];

const orbitPositions = [
  { x: -192, y: -136, rotate: -22, scale: 0.96 },
  { x: 0, y: -184, rotate: 14, scale: 1.05 },
  { x: 182, y: -120, rotate: 22, scale: 0.9 },
  { x: 204, y: 24, rotate: -16, scale: 1 },
  { x: 118, y: 168, rotate: 20, scale: 0.9 },
  { x: -92, y: 184, rotate: -18, scale: 1.04 },
  { x: -198, y: 70, rotate: 24, scale: 0.92 },
  { x: -156, y: -34, rotate: -14, scale: 0.88 },
];

const dustMotes = [
  { x: '18%', y: '22%', size: 5, delay: '0.1s', duration: '3.6s' },
  { x: '29%', y: '70%', size: 4, delay: '0.6s', duration: '4.2s' },
  { x: '46%', y: '18%', size: 3, delay: '0.2s', duration: '3.2s' },
  { x: '57%', y: '78%', size: 5, delay: '0.8s', duration: '4s' },
  { x: '70%', y: '26%', size: 4, delay: '0.35s', duration: '3.8s' },
  { x: '79%', y: '64%', size: 3, delay: '1s', duration: '4.4s' },
];

export default function WebsiteLoader({ onFinished }) {
  const [phase, setPhase] = useState('orbit');
  const [visible, setVisible] = useState(true);

  const statusLabel = useMemo(() => {
    if (phase === 'orbit') return 'Initializing signal layers';
    if (phase === 'settle') return 'Preparing your workspace';
    if (phase === 'wordmark') return 'Loading InvestWise';
    return 'Ready';
  }, [phase]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('settle'), 700),
      setTimeout(() => setPhase('mark'), 1750),
      setTimeout(() => setPhase('wordmark'), 2350),
      setTimeout(() => setPhase('fadeout'), 3550),
      setTimeout(() => {
        setVisible(false);
        onFinished?.();
      }, 4150),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onFinished]);

  if (!visible) return null;

  return (
    <div className={`website-loader ${phase === 'fadeout' ? 'website-loader--fadeout' : ''}`}>
      <style>{`
        .website-loader {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          overflow: hidden;
          background:
            radial-gradient(circle at top left, rgba(99, 102, 241, 0.22), transparent 28%),
            radial-gradient(circle at bottom right, rgba(52, 211, 153, 0.14), transparent 24%),
            linear-gradient(180deg, rgba(6, 10, 20, 0.92), rgba(5, 9, 18, 0.98)),
            #070b16;
          transition: opacity 0.55s ease, visibility 0.55s ease;
          isolation: isolate;
        }

        .website-loader::before,
        .website-loader::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .website-loader::before {
          background:
            linear-gradient(180deg, rgba(6, 10, 20, 0.1), rgba(6, 10, 20, 0.22)),
            url('/background.svg');
          background-size: cover, 980px 980px;
          background-position: center, center;
          background-repeat: no-repeat, repeat;
          opacity: 0.32;
          mix-blend-mode: screen;
          z-index: 0;
        }

        .website-loader::after {
          background:
            radial-gradient(circle at center, rgba(129, 140, 248, 0.08), transparent 32%),
            radial-gradient(circle at center, rgba(253, 230, 138, 0.06), transparent 42%);
          z-index: 0;
        }

        .website-loader--fadeout {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        .website-loader__shell {
          position: relative;
          z-index: 1;
          width: min(92vw, 760px);
          display: grid;
          justify-items: center;
          gap: 1.75rem;
          padding: 2rem 1rem 2.5rem;
        }

        .website-loader__halo {
          position: absolute;
          inset: 50% auto auto 50%;
          width: 460px;
          height: 460px;
          border-radius: 999px;
          transform: translate(-50%, -50%);
          background:
            radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, rgba(99, 102, 241, 0.08) 36%, transparent 64%);
          filter: blur(12px);
          animation: loaderHaloPulse 3.4s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes loaderHaloPulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(0.96);
            opacity: 0.7;
          }

          50% {
            transform: translate(-50%, -50%) scale(1.08);
            opacity: 1;
          }
        }

        .website-loader__stage {
          position: relative;
          width: min(78vw, 520px);
          aspect-ratio: 1;
          display: grid;
          place-items: center;
        }

        .website-loader__ring,
        .website-loader__ring::before {
          position: absolute;
          inset: 50% auto auto 50%;
          border-radius: 999px;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .website-loader__ring {
          width: 332px;
          height: 332px;
          border: 1px solid rgba(148, 163, 184, 0.12);
          box-shadow:
            inset 0 0 0 1px rgba(255, 255, 255, 0.02),
            0 0 90px rgba(99, 102, 241, 0.1);
        }

        .website-loader__ring::before {
          content: '';
          width: 248px;
          height: 248px;
          border: 1px dashed rgba(165, 180, 252, 0.16);
          animation: loaderRingRotate 16s linear infinite;
        }

        @keyframes loaderRingRotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .website-loader__glyph {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 50px;
          height: 50px;
          padding: 0.85rem;
          border-radius: 18px;
          color: rgba(224, 231, 255, 0.8);
          background: linear-gradient(180deg, rgba(19, 30, 56, 0.72), rgba(12, 20, 38, 0.58));
          border: 1px solid rgba(165, 180, 252, 0.16);
          box-shadow:
            0 18px 32px rgba(5, 8, 18, 0.34),
            0 0 24px rgba(99, 102, 241, 0.08);
          backdrop-filter: blur(18px);
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.4);
          animation: loaderGlyphAppear 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: var(--delay);
        }

        .website-loader__glyph svg {
          width: 100%;
          height: 100%;
        }

        .website-loader__glyph--settle,
        .website-loader__glyph--mark,
        .website-loader__glyph--wordmark,
        .website-loader--fadeout .website-loader__glyph {
          animation: loaderGlyphSettle 0.95s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: calc(var(--delay) * 0.36);
        }

        @keyframes loaderGlyphAppear {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.15) rotate(calc(var(--rotate) * 1deg));
          }

          100% {
            opacity: 1;
            transform: translate(calc(-50% + var(--x) * 1px), calc(-50% + var(--y) * 1px)) rotate(calc(var(--rotate) * 1deg)) scale(var(--scale));
          }
        }

        @keyframes loaderGlyphSettle {
          0% {
            opacity: 1;
            transform: translate(calc(-50% + var(--x) * 1px), calc(-50% + var(--y) * 1px)) rotate(calc(var(--rotate) * 1deg)) scale(var(--scale));
          }

          72% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(0deg) scale(0.66);
          }

          100% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(0deg) scale(0.08);
          }
        }

        .website-loader__mark-wrap {
          position: relative;
          display: grid;
          place-items: center;
          width: 174px;
          height: 174px;
          border-radius: 42px;
          background: linear-gradient(180deg, rgba(18, 28, 50, 0.72), rgba(10, 16, 30, 0.52));
          border: 1px solid rgba(165, 180, 252, 0.18);
          box-shadow:
            0 24px 60px rgba(5, 8, 18, 0.38),
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            0 0 60px rgba(99, 102, 241, 0.12);
          opacity: 0;
          transform: scale(0.74);
        }

        .website-loader__mark-wrap::before {
          content: '';
          position: absolute;
          inset: 12px;
          border-radius: 30px;
          border: 1px solid rgba(255, 255, 255, 0.04);
          pointer-events: none;
        }

        .website-loader__mark-wrap--visible {
          animation: loaderMarkReveal 0.72s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes loaderMarkReveal {
          0% {
            opacity: 0;
            transform: scale(0.62);
          }

          70% {
            opacity: 1;
            transform: scale(1.04);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .website-loader__mark {
          width: 96px;
          height: 96px;
          filter: drop-shadow(0 0 24px rgba(129, 140, 248, 0.25));
        }

        .website-loader__mote {
          position: absolute;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(253, 230, 138, 0.88), rgba(129, 140, 248, 0.55) 60%, transparent 100%);
          animation: loaderMoteFloat var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
          pointer-events: none;
        }

        @keyframes loaderMoteFloat {
          0%, 100% {
            transform: translateY(0px) scale(0.9);
            opacity: 0.2;
          }

          50% {
            transform: translateY(-16px) scale(1.14);
            opacity: 0.85;
          }
        }

        .website-loader__copy {
          display: grid;
          justify-items: center;
          gap: 0.75rem;
          text-align: center;
        }

        .website-loader__eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.52rem;
          padding: 0.5rem 0.85rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(191, 203, 231, 0.86);
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .website-loader__eyebrow-dot {
          width: 0.48rem;
          height: 0.48rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #fde68a, #818cf8);
          box-shadow: 0 0 18px rgba(129, 140, 248, 0.4);
        }

        .website-loader__wordmark {
          display: inline-flex;
          align-items: baseline;
          justify-content: center;
          gap: 0.06em;
          min-height: 4.5rem;
          font-family: 'Space Grotesk', 'Inter', sans-serif;
          font-size: calc(clamp(2.9rem, 7vw, 4.35rem));
          font-weight: 700;
          letter-spacing: -0.075em;
          line-height: 0.94;
          text-shadow: 0 0 26px rgba(99, 102, 241, 0.16);
        }

        .website-loader__word {
          opacity: 0;
          transform: translateY(18px);
        }

        .website-loader__wordmark--visible .website-loader__word {
          animation: loaderWordReveal 0.52s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .website-loader__wordmark--visible .website-loader__word:last-child {
          animation-delay: 0.08s;
        }

        @keyframes loaderWordReveal {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .website-loader__word--base {
          color: #edf3ff;
        }

        .website-loader__word--accent {
          background: linear-gradient(135deg, #8b5cf6 0%, #818cf8 52%, #60a5fa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .website-loader__status {
          color: rgba(160, 176, 205, 0.88);
          font-size: 1rem;
          letter-spacing: -0.01em;
        }

        .website-loader__progress {
          position: relative;
          width: min(84vw, 320px);
          height: 6px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.05);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
        }

        .website-loader__progress-fill {
          position: absolute;
          inset: 0 auto 0 0;
          width: 28%;
          border-radius: inherit;
          background: linear-gradient(90deg, #8b5cf6 0%, #818cf8 60%, #6ee7b7 100%);
          box-shadow: 0 0 22px rgba(129, 140, 248, 0.35);
          transition: width 0.5s ease;
        }

        .website-loader__progress-fill--settle {
          width: 58%;
        }

        .website-loader__progress-fill--mark {
          width: 82%;
        }

        .website-loader__progress-fill--wordmark,
        .website-loader__progress-fill--fadeout {
          width: 100%;
        }

        @media (prefers-reduced-motion: reduce) {
          .website-loader *,
          .website-loader::before,
          .website-loader::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        @media (max-width: 640px) {
          .website-loader__shell {
            gap: 1.35rem;
            padding-bottom: 2rem;
          }

          .website-loader__stage {
            width: min(88vw, 390px);
          }

          .website-loader__ring {
            width: 264px;
            height: 264px;
          }

          .website-loader__ring::before {
            width: 196px;
            height: 196px;
          }

          .website-loader__glyph {
            width: 42px;
            height: 42px;
            border-radius: 15px;
            padding: 0.72rem;
          }

          .website-loader__mark-wrap {
            width: 144px;
            height: 144px;
            border-radius: 32px;
          }

          .website-loader__mark-wrap::before {
            inset: 10px;
            border-radius: 24px;
          }

          .website-loader__mark {
            width: 78px;
            height: 78px;
          }

          .website-loader__status {
            font-size: 0.94rem;
          }
        }
      `}</style>

      <div className="website-loader__shell">
        <div className="website-loader__halo" />

        <div className="website-loader__stage">
          <div className="website-loader__ring" />

          {dustMotes.map((mote, index) => (
            <span
              key={`mote-${index}`}
              className="website-loader__mote"
              style={{
                left: mote.x,
                top: mote.y,
                width: `${mote.size}px`,
                height: `${mote.size}px`,
                '--delay': mote.delay,
                '--duration': mote.duration,
              }}
            />
          ))}

          {orbitGlyphs.map((glyph, index) => {
            const position = orbitPositions[index];
            const isSettled = phase === 'settle' || phase === 'mark' || phase === 'wordmark' || phase === 'fadeout';

            return (
              <div
                key={`glyph-${index}`}
                className={`website-loader__glyph ${isSettled ? 'website-loader__glyph--settle' : ''}`}
                style={{
                  '--x': position.x,
                  '--y': position.y,
                  '--rotate': position.rotate,
                  '--scale': position.scale,
                  '--delay': `${index * 0.055}s`,
                }}
              >
                {glyph}
              </div>
            );
          })}

          <div className={`website-loader__mark-wrap ${phase === 'mark' || phase === 'wordmark' || phase === 'fadeout' ? 'website-loader__mark-wrap--visible' : ''}`}>
            <img src="/favicon.svg" alt="InvestWise" className="website-loader__mark" />
          </div>
        </div>

        <div className="website-loader__copy">
          <div className="website-loader__eyebrow">
            <span className="website-loader__eyebrow-dot" />
            Secure Finance Workspace
          </div>

          <div className={`website-loader__wordmark ${phase === 'wordmark' || phase === 'fadeout' ? 'website-loader__wordmark--visible' : ''}`}>
            <span className="website-loader__word website-loader__word--base">Invest</span>
            <span className="website-loader__word website-loader__word--accent">Wise</span>
          </div>

          <p className="website-loader__status">{statusLabel}</p>

          <div className="website-loader__progress" aria-hidden="true">
            <div className={`website-loader__progress-fill website-loader__progress-fill--${phase}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
