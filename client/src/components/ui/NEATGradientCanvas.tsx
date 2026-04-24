'use client';

import { useEffect, useRef } from 'react';
import { NeatGradient } from '@firecms/neat';

export default function NEATGradientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientRef = useRef<NeatGradient | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const config = {
      colors: [
        { color: '#ffffff', enabled: true },
        { color: '#f0f9ff', enabled: true }, // Sky 50
        { color: '#e0f2fe', enabled: true }, // Sky 100
        { color: '#bae6fd', enabled: true }, // Sky 200
        { color: '#38bdf8', enabled: true }, // Sky 400
        { color: '#0369a1', enabled: true }, // Sky 700
      ],
      speed: 3.5,
      horizontalPressure: 2.5,
      verticalPressure: 3,
      waveFrequencyX: 1.8,
      waveFrequencyY: 2.2,
      waveAmplitude: 3,
      shadows: 0.5,
      highlights: 3,
      colorBrightness: 1.1,
      colorSaturation: 0.6,
      wireframe: false,
      colorBlending: 5,
      backgroundColor: '#ffffff',
      backgroundAlpha: 1,
      grainScale: 0.3,
      grainSparsity: 0.2,
      grainIntensity: 0.05,
      grainSpeed: 0.6,
      resolution: 1,
      yOffset: 0,
      yOffsetWaveMultiplier: 2,
      yOffsetColorMultiplier: 2,
      yOffsetFlowMultiplier: 2,
      flowDistortionA: 20,
      flowDistortionB: 25,
      flowScale: 0.9,
      flowEase: 0.3,
      flowEnabled: true,
      enableProceduralTexture: false,
      vignetteIntensity: 0,
      vignetteRadius: 1,
      bloomIntensity: 0.1,
      bloomThreshold: 0.8,
      chromaticAberration: 0.2,
    };

    try {
      const gradient = new NeatGradient({
        ref: canvas,
        ...config,
      });
      gradientRef.current = gradient;

      // React to scroll
      const handleScroll = () => {
        if (gradientRef.current) {
          gradientRef.current.yOffset = window.scrollY * 0.3;
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } catch (error) {
      console.error('NEAT Gradient initialization error:', error);
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="gradient"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
      }}
    />
  );
}
