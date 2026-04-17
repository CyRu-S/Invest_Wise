import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './MagicBentoGrid.css';

const DEFAULT_GLOW_COLOR = '99, 102, 241';
const DEFAULT_SPOTLIGHT_RADIUS = 320;
const MOBILE_BREAKPOINT = 900;
const DEFAULT_PARTICLE_COUNT = 10;

function getMotionDisabled() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= MOBILE_BREAKPOINT || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function useMotionDisabled() {
  const [motionDisabled, setMotionDisabled] = useState(getMotionDisabled);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionState = () => {
      setMotionDisabled(window.innerWidth <= MOBILE_BREAKPOINT || mediaQuery.matches);
    };

    updateMotionState();
    window.addEventListener('resize', updateMotionState);
    mediaQuery.addEventListener?.('change', updateMotionState);

    return () => {
      window.removeEventListener('resize', updateMotionState);
      mediaQuery.removeEventListener?.('change', updateMotionState);
    };
  }, []);

  return motionDisabled;
}

function createParticleElement(x, y, glowColor) {
  const particle = document.createElement('div');
  const size = 3 + Math.random() * 3;

  particle.className = 'magic-bento-particle';
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;
  particle.style.background = `rgba(${glowColor}, 0.95)`;
  particle.style.boxShadow = `0 0 14px rgba(${glowColor}, 0.55)`;

  return particle;
}

function isLightTheme() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.dataset.theme === 'light';
}

export function MagicBentoGrid({
  children,
  className = '',
  pattern = 'catalog',
  glowColor = DEFAULT_GLOW_COLOR,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  enableSpotlight = true,
}) {
  const gridRef = useRef(null);
  const motionDisabled = useMotionDisabled();

  useEffect(() => {
    if (!enableSpotlight || motionDisabled || !gridRef.current) return undefined;
    const gridElement = gridRef.current;

    const resetCards = () => {
      const cards = gridElement.querySelectorAll('.magic-bento-card');
      cards.forEach((card) => {
        card.style.setProperty('--glow-intensity', '0');
      });
    };

    const handlePointerMove = (event) => {
      const cards = gridElement.querySelectorAll('.magic-bento-card');

      const fullGlowDistance = spotlightRadius * 0.55;
      const fadeDistance = spotlightRadius * 0.95;

      cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(event.clientX - centerX, event.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);
        const relativeX = ((event.clientX - cardRect.left) / cardRect.width) * 100;
        const relativeY = ((event.clientY - cardRect.top) / cardRect.height) * 100;

        let intensity = 0;
        if (effectiveDistance <= fullGlowDistance) {
          intensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          intensity = (fadeDistance - effectiveDistance) / (fadeDistance - fullGlowDistance);
        }

        card.style.setProperty('--glow-x', `${relativeX}%`);
        card.style.setProperty('--glow-y', `${relativeY}%`);
        card.style.setProperty('--glow-radius', `${spotlightRadius}px`);
        card.style.setProperty('--glow-intensity', intensity.toFixed(3));
      });
    };

    const handlePointerLeave = () => resetCards();

    gridElement.addEventListener('pointermove', handlePointerMove);
    gridElement.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      gridElement.removeEventListener('pointermove', handlePointerMove);
      gridElement.removeEventListener('pointerleave', handlePointerLeave);
      resetCards();
    };
  }, [enableSpotlight, glowColor, motionDisabled, spotlightRadius]);

  return (
    <div
      ref={gridRef}
      className={`magic-bento-grid magic-bento-grid--${pattern} ${className}`.trim()}
      style={{ '--bento-glow-color': glowColor }}
    >
      {children}
    </div>
  );
}

export function MagicBentoCard({
  as: Component = 'article',
  children,
  className = '',
  style,
  glowColor = DEFAULT_GLOW_COLOR,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,
  enableMagnetism = false,
  enableParticles = true,
  clickEffect = true,
  ...props
}) {
  const cardRef = useRef(null);
  const motionDisabled = useMotionDisabled();

  useEffect(() => {
    const element = cardRef.current;
    if (!element || motionDisabled) return undefined;

    const particles = [];
    const timeouts = [];
    let isHovered = false;

    const clearParticles = () => {
      timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      timeouts.length = 0;
      particles.forEach((particle) => {
        gsap.killTweensOf(particle);
        particle.remove();
      });
      particles.length = 0;
    };

    const spawnParticles = () => {
      if (!enableParticles) return;

      const rect = element.getBoundingClientRect();
      for (let index = 0; index < particleCount; index += 1) {
        const timeoutId = window.setTimeout(() => {
          if (!isHovered) return;

          const particle = createParticleElement(Math.random() * rect.width, Math.random() * rect.height, glowColor);
          element.appendChild(particle);
          particles.push(particle);

          gsap.fromTo(
            particle,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.28, ease: 'back.out(1.7)' }
          );

          gsap.to(particle, {
            x: (Math.random() - 0.5) * 90,
            y: (Math.random() - 0.5) * 90,
            duration: 2 + Math.random() * 1.8,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });

          gsap.to(particle, {
            opacity: 0.2,
            duration: 1.4,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }, index * 70);

        timeouts.push(timeoutId);
      }
    };

    const handlePointerEnter = (event) => {
      isHovered = true;
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      element.style.setProperty('--glow-x', `${(x / rect.width) * 100}%`);
      element.style.setProperty('--glow-y', `${(y / rect.height) * 100}%`);
      element.style.setProperty('--glow-intensity', isLightTheme() ? '0.78' : '0.9');
      spawnParticles();
    };

    const handlePointerMove = (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      element.style.setProperty('--glow-x', `${(x / rect.width) * 100}%`);
      element.style.setProperty('--glow-y', `${(y / rect.height) * 100}%`);
      element.style.setProperty('--glow-intensity', isLightTheme() ? '0.86' : '1');

      const animationTarget = {};

      if (enableTilt) {
        animationTarget.rotateX = ((y - centerY) / centerY) * -7;
        animationTarget.rotateY = ((x - centerX) / centerX) * 7;
      }

      if (enableMagnetism) {
        animationTarget.x = (x - centerX) * 0.04;
        animationTarget.y = (y - centerY) * 0.04;
      }

      if (Object.keys(animationTarget).length > 0) {
        gsap.to(element, {
          ...animationTarget,
          duration: 0.18,
          ease: 'power2.out',
          overwrite: true,
          transformPerspective: 1000,
        });
      }
    };

    const handlePointerLeave = () => {
      isHovered = false;
      clearParticles();
      element.style.setProperty('--glow-intensity', '0');
      gsap.to(element, {
        rotateX: 0,
        rotateY: 0,
        x: 0,
        y: 0,
        duration: 0.28,
        ease: 'power2.out',
        overwrite: true,
      });
    };

    const handleClick = (event) => {
      if (!clickEffect) return;

      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );
      const ripple = document.createElement('div');

      ripple.className = 'magic-bento-ripple';
      ripple.style.width = `${maxDistance * 2}px`;
      ripple.style.height = `${maxDistance * 2}px`;
      ripple.style.left = `${x - maxDistance}px`;
      ripple.style.top = `${y - maxDistance}px`;
      ripple.style.background = isLightTheme()
        ? `radial-gradient(circle, rgba(${glowColor}, 0.34) 0%, rgba(${glowColor}, 0.16) 35%, transparent 74%)`
        : `radial-gradient(circle, rgba(${glowColor}, 0.28) 0%, rgba(${glowColor}, 0.12) 35%, transparent 72%)`;
      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.75,
          ease: 'power2.out',
          onComplete: () => ripple.remove(),
        }
      );
    };

    element.addEventListener('pointerenter', handlePointerEnter);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerleave', handlePointerLeave);
    element.addEventListener('click', handleClick);

    return () => {
      element.removeEventListener('pointerenter', handlePointerEnter);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerleave', handlePointerLeave);
      element.removeEventListener('click', handleClick);
      clearParticles();
    };
  }, [clickEffect, enableMagnetism, enableParticles, enableTilt, glowColor, motionDisabled, particleCount]);

  return (
    <Component
      ref={cardRef}
      className={`magic-bento-card ${className}`.trim()}
      style={{
        ...style,
        '--bento-glow-color': glowColor,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
