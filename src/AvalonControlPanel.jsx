import React from 'react';
import { EyeIcon } from './AvalonTokens.jsx';

export function AvalonControlPanel({ 
  showImages, 
  onToggleImages, 
  onYesClick, 
  onNoClick, 
  yesImage, 
  noImage, 
  size = 40,
  style = {} 
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 16px',
      background: 'linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(40,40,40,0.9) 50%, rgba(20,20,20,0.95) 100%)',
      border: '2px solid rgba(61, 56, 0, 0.8)',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)',
      backdropFilter: 'blur(4px)',
      ...style
    }}>
      <style>
        {`
          * {
            outline: none !important;
            -webkit-tap-highlight-color: transparent !important;
            -webkit-focus-ring-color: transparent !important;
          }
          *:focus {
            outline: none !important;
            -webkit-tap-highlight-color: transparent !important;
            -webkit-focus-ring-color: transparent !important;
          }
        `}
      </style>
      {/* Eye Icon */}
      <EyeIcon
        size={size}
        isActive={showImages}
        onClick={onToggleImages}
      />
      
      {/* Separator */}
      <div style={{
        width: '1px',
        height: size * 0.8,
        background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3), transparent)',
        boxShadow: '0 0 4px rgba(255,255,255,0.2)'
      }} />
      
      {/* Yes Button */}
      <div
        style={{
          width: size,
          height: size,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(76,175,80,0.2) 0%, rgba(76,175,80,0.1) 70%)',
          border: '2px solid rgba(76,175,80,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
          WebkitFocusRingColor: 'transparent',
          pointerEvents: 'auto'
        }}
        onClick={onYesClick}
        onMouseEnter={(e) => {
          e.target.style.background = 'radial-gradient(circle, rgba(76,175,80,0.4) 0%, rgba(76,175,80,0.2) 70%)';
          e.target.style.border = '2px solid rgba(76,175,80,0.6)';
          e.target.style.transform = 'scale(1.05)';
          e.target.style.outline = 'none';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'radial-gradient(circle, rgba(76,175,80,0.2) 0%, rgba(76,175,80,0.1) 70%)';
          e.target.style.border = '2px solid rgba(76,175,80,0.4)';
          e.target.style.transform = 'scale(1)';
          e.target.style.outline = 'none';
        }}
      >
        <img 
          src={yesImage} 
          alt="Yes" 
          style={{
            width: size * 0.6,
            height: size * 0.6,
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
            outline: 'none',
            WebkitTapHighlightColor: 'transparent',
            WebkitFocusRingColor: 'transparent',
            pointerEvents: 'none'
          }}
        />
      </div>
      
      {/* No Button */}
      <div
        style={{
          width: size,
          height: size,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,67,54,0.2) 0%, rgba(244,67,54,0.1) 70%)',
          border: '2px solid rgba(244,67,54,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
          WebkitFocusRingColor: 'transparent',
          pointerEvents: 'auto'
        }}
        onClick={onNoClick}
        onMouseEnter={(e) => {
          e.target.style.background = 'radial-gradient(circle, rgba(244,67,54,0.4) 0%, rgba(244,67,54,0.2) 70%)';
          e.target.style.border = '2px solid rgba(244,67,54,0.6)';
          e.target.style.transform = 'scale(1.05)';
          e.target.style.outline = 'none';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'radial-gradient(circle, rgba(244,67,54,0.2) 0%, rgba(244,67,54,0.1) 70%)';
          e.target.style.border = '2px solid rgba(244,67,54,0.4)';
          e.target.style.transform = 'scale(1)';
          e.target.style.outline = 'none';
        }}
      >
        <img 
          src={noImage} 
          alt="No" 
          style={{
            width: size * 0.6,
            height: size * 0.6,
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
            outline: 'none',
            WebkitTapHighlightColor: 'transparent',
            WebkitFocusRingColor: 'transparent',
            pointerEvents: 'none'
          }}
        />
      </div>
    </div>
  );
}
