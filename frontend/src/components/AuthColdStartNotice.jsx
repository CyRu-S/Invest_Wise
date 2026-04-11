import { useEffect, useState } from 'react';

export default function AuthColdStartNotice({ shouldOpen = false }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(shouldOpen);
  }, [shouldOpen]);

  useEffect(() => {
    document.body.classList.toggle('modal-open', isOpen);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay px-4" role="presentation" onClick={() => setIsOpen(false)}>
      <div
        className="modal-content overflow-hidden rounded-[2rem] border border-amber-300/25 bg-[#0f172a]/95 shadow-[0_24px_80px_rgba(15,23,42,0.45)] backdrop-blur-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="render-cold-start-title"
        aria-describedby="render-cold-start-description"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-4 p-6 text-left text-white sm:p-7">
          <div className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
            Quick heads-up
          </div>

          <div className="space-y-2">
            <h2 id="render-cold-start-title" className="text-2xl font-semibold leading-tight text-white">
              The backend may take a minute to wake up
            </h2>
            <p id="render-cold-start-description" className="text-sm leading-6 text-slate-300">
              I deployed the backend on Render&apos;s free tier, so the first request can take around 1 to 2 minutes while the server becomes active. Once it wakes up, the app should work normally.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
            If the page feels slow at first, please wait a moment and try again.
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-200"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
