import React from 'react';

export const QuestTeamToken = ({ portraitWidth, isVertical }) => (
    <>
        <div style={{
            fontSize: portraitWidth * 0.27,
            color: '#6a1b9a',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        }}>🛡️</div>
        <div style={{
            fontSize: portraitWidth * 0.24,
            position: 'absolute',
            // transform: 'translateX(-50%)',
            color: '#fff',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            // transform: `${isVertical ? 'rotate(180deg)' : 'rotate(90deg)'}`
            transform: isVertical ? '' : 'rotate(90deg)'
        }}>🗡️</div>
    </>
);

export const QuestVote = ({ portraitWidth }) => (
    <div style={{
        width: portraitWidth * 0.18,
        height: portraitWidth * 0.18,
        borderRadius: '50%',
        background: '#9c27b0',
        border: '2px solid #333',
        boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
    }} />
); 

export function CrownIcon({ size = 24, isLeader = false, style = {} }) {
    const glow = isLeader ? '0 0 10px rgba(221,187,83,0.9)' : '0 0 2px rgba(0,0,0,0.6)';
    return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          aria-hidden="true"
          role="img"
          style={{ display: 'block', filter: `drop-shadow(${glow})`, ...style }}
        >
          <defs>
            <linearGradient id="crownGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffd97a" />
              <stop offset="1" stopColor="#dcae3a" />
            </linearGradient>
            <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
    
          <g fill="url(#crownGradient)" stroke="#b58020" strokeWidth="2" filter="url(#soft)">
            {/* Base shape */}
            <path d="
              M4 50 
              L10 20 L22 35 L32 12 L42 35 L54 20 L60 50 Z
            " />
            
          </g>
    
          {/* Jewels */}
          <circle cx="32" cy="16" r="2.5" fill="#fff7e0" stroke="#caa648" />
          <circle cx="16" cy="28" r="2" fill="#fff3d6" stroke="#caa648" />
          <circle cx="48" cy="28" r="2" fill="#fff3d6" stroke="#caa648" />
        </svg>
      );
  }


  export function DecisionSword({
    size = 256, // fully scalable
    angle = 30,
    isShiny = true,
    style = {}
  }) {
    const glow = isShiny ? '0 0 12px rgba(200,220,255,0.45)' : 'none';
  
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 300" // taller viewBox for longer handle
        style={{ display: 'block', filter: glow, ...style }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bladeGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#f7fbff" />
            <stop offset="0.45" stopColor="#dfe9f3" />
            <stop offset="0.65" stopColor="#bfc9d4" />
            <stop offset="1" stopColor="#9aa3ad" />
          </linearGradient>
          <linearGradient id="edgeGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.4" stopColor="#d7e4ef" />
            <stop offset="1" stopColor="rgba(255,255,255,0.05)" />
          </linearGradient>
          <linearGradient id="guardGrad" x1="0" x2="1">
            <stop offset="0" stopColor="#f0f0f0"/>
            <stop offset="1" stopColor="#9b9b9b"/>
          </linearGradient>
          <radialGradient id="pommelGrad" cx="50%" cy="40%">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#777" />
          </radialGradient>
          <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.25"/>
          </filter>
        </defs>
  
        {/* rotate whole sword */}
        <g transform={`translate(100 150) rotate(${angle}) translate(-100 -150)`}>
  
          {/* blade */}
          <path
            d="M90 10 L110 10 L110 200 Q110 205 100 210 Q90 205 90 200 Z"
            fill="url(#bladeGrad)"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth="0.5"
            filter="url(#softShadow)"
          />
  
          {/* guard */}
          <rect x="60" y="200" width="80" height="10" rx="5"
            fill="url(#guardGrad)" stroke="#6f6f6f" strokeWidth="0.8" />
  
          {/* handle (longer now) */}
          <rect x="90" y="210" width="20" height="60" rx="4"
            fill="#2c2c2c" />
  
          {/* pommel */}
          <circle cx="100" cy="275" r="8" fill="url(#pommelGrad)" stroke="#4a4a4a" strokeWidth="0.8" />
        </g>
      </svg>
    );
  }
  