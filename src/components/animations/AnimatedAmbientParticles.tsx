import React from 'react';
import { motion } from 'motion/react';
import { CardStyleId } from '../../types.ts';

export type AmbientParticleType = 
  | 'auto'
  | 'petals' 
  | 'gold-sparkles' 
  | 'champagne-bubbles' 
  | 'fireflies' 
  | 'stars' 
  | 'none';

interface AnimatedAmbientParticlesProps {
  variant?: string;
  cardStyle?: CardStyleId | string;
  className?: string;
  count?: number;
}

export const AnimatedAmbientParticles: React.FC<AnimatedAmbientParticlesProps> = ({
  variant = 'auto',
  cardStyle = 'classic-gold',
  className = '',
  count,
}) => {
  // Resolve 'auto' to the natural theme particle type
  let resolvedVariant: AmbientParticleType = (variant as AmbientParticleType) || 'auto';
  if (resolvedVariant === 'auto') {
    switch (cardStyle) {
      case 'romantic-floral':
      case 'lavender-provence':
      case 'watercolor-garden':
        resolvedVariant = 'petals';
        break;
      case 'classic-gold':
      case 'champagne-glam':
      case 'royal-navy':
        resolvedVariant = 'gold-sparkles';
        break;
      case 'dark-luxury':
        resolvedVariant = 'stars';
        break;
      case 'boho-chic':
      case 'terracotta-sunset':
      case 'emerald-botanical':
        resolvedVariant = 'fireflies';
        break;
      case 'minimal-editorial':
      case 'coastal-breeze':
        resolvedVariant = 'champagne-bubbles';
        break;
      default:
        resolvedVariant = 'gold-sparkles';
        break;
    }
  }

  if (resolvedVariant === 'none') {
    return null;
  }

  // Petals system
  if (resolvedVariant === 'petals') {
    const totalCount = count ?? 14;
    const items = Array.from({ length: totalCount }, (_, i) => ({
      id: i,
      x: (i * 100) / totalCount + (i % 3) * 3,
      size: 14 + (i % 4) * 4,
      delay: (i * 0.8) % 6,
      duration: 8 + (i % 5) * 2.2,
      sway: 18 + (i % 3) * 14,
      rotation: i * 45,
      opacity: 0.35 + (i % 3) * 0.15,
      color: i % 4 === 0 ? '#F4C2C2' : i % 4 === 1 ? '#E2B18E' : i % 4 === 2 ? '#D4A373' : '#E8A598',
    }));

    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden z-0 ${className}`}>
        {items.map((p) => (
          <motion.svg
            key={p.id}
            viewBox="0 0 30 30"
            className="absolute"
            style={{
              left: `${p.x}%`,
              top: '-5%',
              width: p.size,
              height: p.size,
            }}
            initial={{ y: -30, opacity: 0, rotate: 0 }}
            animate={{
              y: ['0vh', '105vh'],
              x: [0, p.sway, -p.sway, 0],
              opacity: [0, p.opacity, p.opacity, 0],
              rotate: [p.rotation, p.rotation + 360],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          >
            <path
              d="M15 2 C22 5, 27 12, 25 20 C23 27, 15 28, 10 24 C5 20, 8 8, 15 2 Z"
              fill={p.color}
              opacity="0.8"
            />
            <path
              d="M15 4 C18 10, 18 18, 12 24"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="0.8"
              strokeLinecap="round"
              fill="none"
            />
          </motion.svg>
        ))}
      </div>
    );
  }

  // Golden Sparkles Dust
  if (resolvedVariant === 'gold-sparkles') {
    const totalCount = count ?? 16;
    const items = Array.from({ length: totalCount }, (_, i) => ({
      id: i,
      x: (i * 96) / totalCount + 2,
      y: 10 + ((i * 23) % 80),
      size: 10 + (i % 3) * 6,
      delay: (i * 0.6) % 5,
      duration: 3.5 + (i % 4) * 1.5,
      color: i % 3 === 0 ? '#FDE68A' : i % 3 === 1 ? '#D4AF37' : '#FFF7C2',
    }));

    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden z-0 ${className}`}>
        {items.map((s) => (
          <motion.svg
            key={s.id}
            viewBox="0 0 24 24"
            className="absolute"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
            }}
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{
              scale: [0.2, 1.25, 0.4, 1.1, 0.2],
              opacity: [0, 0.85, 0.2, 0.9, 0],
              rotate: [0, 90, 180, 270, 360],
              y: [0, -14, 0],
            }}
            transition={{
              duration: s.duration,
              repeat: Infinity,
              delay: s.delay,
              ease: 'easeInOut',
            }}
          >
            <path
              d="M12 2 C12 7, 17 12, 22 12 C17 12, 12 17, 12 22 C12 17, 7 12, 2 12 C7 12, 12 7, 12 2 Z"
              fill={s.color}
            />
            <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" opacity="0.9" />
          </motion.svg>
        ))}
      </div>
    );
  }

  // Champagne Bubbles
  if (resolvedVariant === 'champagne-bubbles') {
    const totalCount = count ?? 18;
    const items = Array.from({ length: totalCount }, (_, i) => ({
      id: i,
      x: (i * 100) / totalCount + (i % 3) * 2,
      size: 7 + (i % 4) * 4,
      delay: (i * 0.7) % 6,
      duration: 6 + (i % 5) * 1.8,
      wobble: 12 + (i % 3) * 8,
      opacity: 0.35 + (i % 3) * 0.15,
    }));

    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden z-0 ${className}`}>
        {items.map((b) => (
          <motion.div
            key={b.id}
            className="absolute rounded-full border border-amber-200/50 bg-gradient-to-tr from-amber-100/30 to-white/60 shadow-[0_0_8px_rgba(251,191,36,0.2)]"
            style={{
              left: `${b.x}%`,
              bottom: '-5%',
              width: b.size,
              height: b.size,
            }}
            initial={{ y: 0, opacity: 0 }}
            animate={{
              y: ['0vh', '-105vh'],
              x: [0, b.wobble, -b.wobble, 0],
              opacity: [0, b.opacity, b.opacity, 0],
              scale: [0.8, 1.1, 0.95, 1.2],
            }}
            transition={{
              duration: b.duration,
              repeat: Infinity,
              delay: b.delay,
              ease: 'easeOut',
            }}
          >
            <div className="absolute top-[18%] left-[22%] w-[25%] h-[25%] rounded-full bg-white/80" />
          </motion.div>
        ))}
      </div>
    );
  }

  // Fireflies Glow
  if (resolvedVariant === 'fireflies') {
    const totalCount = count ?? 15;
    const items = Array.from({ length: totalCount }, (_, i) => ({
      id: i,
      x: 5 + (i * 90) / totalCount + (i % 2) * 5,
      y: 15 + ((i * 37) % 70),
      size: 6 + (i % 3) * 3,
      delay: (i * 0.8) % 5,
      duration: 4.5 + (i % 3) * 1.5,
      color: i % 2 === 0 ? '#FDE047' : '#A3E635',
    }));

    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden z-0 ${className}`}>
        {items.map((f) => (
          <motion.div
            key={f.id}
            className="absolute rounded-full"
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              width: f.size,
              height: f.size,
              backgroundColor: f.color,
              boxShadow: `0 0 12px 3px ${f.color}80, 0 0 20px 6px ${f.color}40`,
            }}
            animate={{
              x: [0, 20, -15, 10, 0],
              y: [0, -25, 15, -10, 0],
              opacity: [0.15, 0.9, 0.3, 0.85, 0.15],
              scale: [0.7, 1.3, 0.8, 1.2, 0.7],
            }}
            transition={{
              duration: f.duration,
              repeat: Infinity,
              delay: f.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    );
  }

  // Celestial Stars
  if (resolvedVariant === 'stars') {
    const totalCount = count ?? 20;
    const items = Array.from({ length: totalCount }, (_, i) => ({
      id: i,
      x: (i * 95) / totalCount + 2,
      y: 8 + ((i * 43) % 84),
      size: 8 + (i % 4) * 3,
      delay: (i * 0.5) % 4,
      duration: 3 + (i % 3) * 1.2,
      isEightPoint: i % 3 === 0,
    }));

    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden z-0 ${className}`}>
        {items.map((st) => (
          <motion.svg
            key={st.id}
            viewBox="0 0 24 24"
            className="absolute"
            style={{
              left: `${st.x}%`,
              top: `${st.y}%`,
              width: st.size,
              height: st.size,
            }}
            animate={{
              opacity: [0.1, 0.95, 0.2, 0.85, 0.1],
              scale: [0.6, 1.2, 0.7, 1.15, 0.6],
              rotate: st.isEightPoint ? [0, 45, 90] : [0, 180],
            }}
            transition={{
              duration: st.duration,
              repeat: Infinity,
              delay: st.delay,
              ease: 'easeInOut',
            }}
          >
            {st.isEightPoint ? (
              <path
                d="M12 1 L14 8 L21 10 L15 14 L17 21 L12 16 L7 21 L9 14 L3 10 L10 8 Z"
                fill="#FFFFFF"
                opacity="0.9"
              />
            ) : (
              <path
                d="M12 2 C12 7, 17 12, 22 12 C17 12, 12 17, 12 22 C12 17, 7 12, 2 12 C7 12, 12 7, 12 2 Z"
                fill="#E0E7FF"
                opacity="0.85"
              />
            )}
            <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
          </motion.svg>
        ))}
      </div>
    );
  }

  return null;
};
