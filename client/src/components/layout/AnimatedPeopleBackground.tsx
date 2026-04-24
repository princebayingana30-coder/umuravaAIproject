'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function AnimatedPeopleBackground() {
  const seekers = [
    { src: '/images/landing/seeker1.png', x: '10%', y: '20%', delay: 0, scale: 0.8 },
    { src: '/images/landing/seeker2.png', x: '80%', y: '15%', delay: 1, scale: 0.7 },
    { src: '/images/landing/group1.png', x: '70%', y: '70%', delay: 2, scale: 0.9 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
      {seekers.map((seeker, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full overflow-hidden blur-[2px] hover:blur-0 transition-all duration-700 backdrop-blur-sm border border-white/10"
          style={{
            left: seeker.x,
            top: seeker.y,
            width: '300px',
            height: '300px',
          }}
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ 
            opacity: [0.1, 0.3, 0.1], 
            scale: seeker.scale, 
            y: [0, -30, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            delay: seeker.delay,
            ease: "easeInOut"
          }}
        >
          <Image
            src={seeker.src}
            alt="TalentIQ Job Seeker"
            fill
            className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
        </motion.div>
      ))}

      {/* Decorative Blur Blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent-blue opacity-10 blur-[120px] rounded-full animate-pulse-glow" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent-purple opacity-10 blur-[120px] rounded-full animate-pulse-glow" style={{ animationDelay: '2s' }} />
    </div>
  );
}
