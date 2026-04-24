'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50" />

      {/* Animated gradient blobs */}
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-600/20 to-blue-900/10 rounded-full blur-3xl"
        animate={{
          y: [0, -50, 0],
          x: [0, 30, 0],
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-600/20 to-purple-900/10 rounded-full blur-3xl"
        animate={{
          y: [0, 40, 0],
          x: [0, -30, 0],
          scale: [1.1, 1, 1.1],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute -bottom-40 left-1/2 w-screen h-96 bg-gradient-to-t from-cyan-600/10 to-transparent rounded-full blur-3xl"
        animate={{
          y: [0, 30, 0],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Mesh grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(0,0,0,0.03)_25%,rgba(0,0,0,0.03)_26%,transparent_27%,transparent_74%,rgba(0,0,0,0.03)_75%,rgba(0,0,0,0.03)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(0,0,0,0.03)_25%,rgba(0,0,0,0.03)_26%,transparent_27%,transparent_74%,rgba(0,0,0,0.03)_75%,rgba(0,0,0,0.03)_76%,transparent_77%,transparent)] bg-[length:50px_50px]" />

      {/* Glow orbs */}
      <motion.div
        className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"
        animate={{
          scale: [1.1, 0.9, 1.1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + i * 10}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
