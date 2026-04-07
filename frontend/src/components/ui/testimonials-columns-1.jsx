import React from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';

export function TestimonialsColumn({ className = '', testimonials, duration = 14 }) {
  return (
    <div className={className}>
      <motion.div
        animate={{ translateY: '-50%' }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {new Array(2).fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {testimonials.map(({ text, image, name, role }, i) => (
              <article
                key={`${name}-${i}-${index}`}
                className="max-w-sm rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(8,12,26,0.92),rgba(10,14,28,0.96))] p-8 shadow-[0_28px_90px_rgba(5,8,24,0.32)] backdrop-blur-xl"
              >
                <div className="mb-6 flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((__, starIndex) => (
                    <Star key={starIndex} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-lg leading-8 text-white/88">{text}</p>
                <div className="mt-8 flex items-center gap-3">
                  <img
                    width={44}
                    height={44}
                    src={image}
                    alt={name}
                    className="h-11 w-11 rounded-full object-cover ring-1 ring-white/12"
                  />
                  <div className="flex flex-col">
                    <div className="font-semibold leading-5 tracking-tight text-white">{name}</div>
                    <div className="leading-5 tracking-tight text-white/50">{role}</div>
                  </div>
                </div>
              </article>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}
