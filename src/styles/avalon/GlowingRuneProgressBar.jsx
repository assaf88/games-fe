import React from 'react';
import './avalon-theme.css';

const StoneEmberProgressBar = () => (
  <div style={{ position: 'relative', width: 320, height: 80, margin: '0 auto' }}>
    {/* Stone slab background */}
    <svg width="320" height="80" viewBox="0 0 320 80" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
      <rect x="10" y="20" width="300" height="40" rx="12" fill="#232323" stroke="#88836a" strokeWidth="4" />
      {/* Carved cracks */}
      <polyline points="30,40 50,45 70,38 90,42" fill="none" stroke="#444" strokeWidth="2" />
      <polyline points="120,55 140,50 160,60 180,52" fill="none" stroke="#444" strokeWidth="2" />
      <polyline points="220,35 240,40 260,32 280,38" fill="none" stroke="#444" strokeWidth="2" />
    </svg>
    {/* Glowing progress fill */}
    <svg width="320" height="80" viewBox="0 0 320 80" style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}>
      <defs>
        <linearGradient id="glow-bar" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e0c97f" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#bfa76f" stopOpacity="0.6" />
        </linearGradient>
        <filter id="glow-bar-effect" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="18" y="28" width="264" height="24" rx="8" fill="url(#glow-bar)" filter="url(#glow-bar-effect)" style={{
        transformOrigin: 'left',
        animation: 'avalon-bar-fill 1.2s linear infinite',
      }} />
    </svg>
    {/* Flickering embers */}
    <svg width="320" height="80" viewBox="0 0 320 80" style={{ position: 'absolute', top: 0, left: 0, zIndex: 3, pointerEvents: 'none' }}>
      {[...Array(8)].map((_, i) => {
        const x = 30 + Math.random() * 260;
        const y = 25 + Math.random() * 30;
        const delay = Math.random();
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={2 + Math.random() * 2}
            fill="#ffb347"
            opacity="0.7"
            style={{
              animation: `ember-flicker 1.2s ${delay}s infinite alternate`,
            }}
          />
        );
      })}
    </svg>
    <style>{`
      @keyframes avalon-bar-fill {
        0% { transform: scaleX(0.2); opacity: 0.7; }
        50% { transform: scaleX(1); opacity: 1; }
        100% { transform: scaleX(0.2); opacity: 0.7; }
      }
      @keyframes ember-flicker {
        0% { opacity: 0.7; r: 2; }
        50% { opacity: 1; r: 4; }
        100% { opacity: 0.7; r: 2; }
      }
    `}</style>
  </div>
);

export default StoneEmberProgressBar; 