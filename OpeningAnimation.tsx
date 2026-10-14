import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

interface OpeningAnimationProps {
  onComplete: () => void;
  enabled: boolean;
}

export const OpeningAnimation: React.FC<OpeningAnimationProps> = ({ onComplete, enabled }) => {
  const [stage, setStage] = useState<'orb' | 'logo' | 'exit'>('orb');

  useEffect(() => {
    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!enabled || prefersReducedMotion) {
      onComplete();
      return;
    }

    // Play subtle startup chime if user had enabled sound
    sound.playStartup();

    const t1 = setTimeout(() => {
      setStage('logo');
    }, 450);

    const t2 = setTimeout(() => {
      setStage('exit');
    }, 1250);

    const t3 = setTimeout(() => {
      onComplete();
    }, 1600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [enabled, onComplete]);

  if (!enabled) return null;

  return (
    <AnimatePresence>
      {stage !== 'exit' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712] overflow-hidden"
        >
          {/* Ambient background glows */}
          <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-purple-600/20 blur-[120px] pointer-events-none" />
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

          {/* Central Liquid Glass Orb & Emblem */}
          <div className="relative flex flex-col items-center">
            {/* Liquid Orb */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-28 h-28 rounded-full p-[2px] bg-gradient-to-b from-cyan-400 via-blue-500 to-indigo-600 shadow-[0_0_50px_rgba(56,189,248,0.4)]"
            >
              {/* Inner glass orb reflection */}
              <div className="w-full h-full rounded-full bg-slate-950/70 backdrop-blur-2xl flex items-center justify-center relative overflow-hidden border border-white/25">
                {/* Gloss highlight */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent rounded-t-full pointer-events-none" />
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative z-10"
                >
                  <Sparkles className="w-11 h-11 text-cyan-300 drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
                </motion.div>
              </div>
            </motion.div>

            {/* Logo text & tagline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: stage === 'logo' ? 1 : 0.8, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="mt-6 text-center"
            >
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
                <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                  SOURCE AI
                </span>
              </h1>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-400/80 font-medium mt-1">
                Intelligence, Without Limits.
              </p>
              <span className="text-[10px] text-slate-500 tracking-wider block mt-2">
                Source Lab • By Saksham Rajawat
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
