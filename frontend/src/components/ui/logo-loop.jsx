import { useState } from 'react';
import { motion } from 'motion/react';

function LogoChip({ logo }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="group flex shrink-0 items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-white/85 shadow-[0_14px_40px_rgba(4,8,24,0.22)] backdrop-blur-xl transition-all duration-300 hover:border-indigo-400/30 hover:bg-white/8 hover:-translate-y-0.5">
      <span className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${logo.gradient} text-sm font-bold tracking-[0.18em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]`}>
        {logo.image && !imageFailed ? (
          <span className="flex h-full w-full items-center justify-center bg-white/95 p-2">
            <img
              src={logo.image}
              alt={`${logo.name} logo`}
              className="h-full w-full object-contain"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          </span>
        ) : (
          logo.mark
        )}
      </span>
      <div className="min-w-0">
        <p className="text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-white/40">{logo.tag}</p>
        <p className="text-[1.05rem] font-medium tracking-tight text-white/90">{logo.name}</p>
      </div>
    </div>
  );
}

export default function LogoLoop({ logos, speed = 26 }) {
  const repeated = [...logos, ...logos];

  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <motion.div
        className="flex w-max gap-4 py-2"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        {repeated.map((logo, index) => (
          <LogoChip key={`${logo.name}-${index}`} logo={logo} />
        ))}
      </motion.div>
    </div>
  );
}
