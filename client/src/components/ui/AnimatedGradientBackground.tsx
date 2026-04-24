'use client';

import { motion, useMotionValue } from 'framer-motion';
import { useEffect } from 'react';

export default function AnimatedGradientBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 16);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 16);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(130deg, #0a0f2c 0%, #1e1b4b 45%, #4f46e5 100%)',
          opacity: 0.96,
          x: mouseX,
          y: mouseY,
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 35%', '0% 0%'],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
      />

      <motion.div
        className="absolute -left-20 -top-16 w-96 h-96 rounded-full blur-[70px] opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(145, 92, 255, 0.22), transparent 62%)', x: mouseX, y: mouseY }}
        animate={{ scale: [1, 1.12, 1], rotate: [0, 8, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: [0.25, 0.1, 0.25, 1] as const }}
      />

      <motion.div
        className="absolute right-0 top-10 w-80 h-80 rounded-full blur-[60px] opacity-24"
        style={{ background: 'radial-gradient(circle, rgba(79, 70, 229, 0.18), transparent 68%)', x: mouseX, y: mouseY }}
        animate={{ scale: [0.96, 1.08, 0.96], rotate: [0, -10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: [0.25, 0.1, 0.25, 1] as const }}
      />

      <motion.div
        className="absolute left-1/2 top-[60%] w-[26rem] h-[26rem] rounded-full blur-[80px] opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.16), transparent 64%)', x: mouseX, y: mouseY }}
        animate={{ scale: [1.02, 0.98, 1.02], opacity: [0.18, 0.24, 0.18] }}
        transition={{ duration: 17, repeat: Infinity, ease: [0.25, 0.1, 0.25, 1] as const }}
      />

      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.02), transparent 15%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.015), transparent 18%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
}
