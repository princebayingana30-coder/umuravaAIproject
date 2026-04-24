'use client';

import { motion, useMotionValue } from 'framer-motion';
import { useEffect } from 'react';

export default function DashboardBackground() {
  const offsetX = useMotionValue(0);
  const offsetY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = ((event.clientX / window.innerWidth) - 0.5) * 24;
      const y = ((event.clientY / window.innerHeight) - 0.5) * 24;
      offsetX.set(x);
      offsetY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [offsetX, offsetY]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 16% 12%, rgba(59, 130, 246, 0.2), transparent 18%), radial-gradient(circle at 88% 20%, rgba(168, 85, 247, 0.18), transparent 20%), radial-gradient(circle at 50% 84%, rgba(56, 189, 248, 0.12), transparent 22%), linear-gradient(180deg, rgba(10, 16, 35, 0.98), rgba(6, 10, 22, 0.96))',
        }}
      />

      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: 'linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px), linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      <motion.div
        className="absolute -left-16 top-10 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl"
        animate={{
          scale: [1, 1.08, 1],
          rotate: [0, 24, 0],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: [0.25, 0.1, 0.25, 1] as const }}
        style={{ x: offsetX, y: offsetY }}
      />

      <motion.div
        className="absolute right-16 top-1/4 w-72 h-72 rounded-full bg-violet-500/18 blur-3xl"
        animate={{
          scale: [1, 0.96, 1],
          rotate: [0, -18, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: [0.25, 0.1, 0.25, 1] as const }}
        style={{ x: offsetX, y: offsetY }}
      />

      <motion.div
        className="absolute left-1/2 top-[62%] w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl"
        animate={{
          scale: [1.05, 0.98, 1.05],
          opacity: [0.08, 0.16, 0.08],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: [0.25, 0.1, 0.25, 1] as const }}
        style={{ x: offsetX, y: offsetY }}
      />
    </div>
  );
}
