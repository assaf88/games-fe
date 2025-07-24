import React from 'react';

const ErrorBanner = ({ message, color = 'orange', style, className }) => (
  <div
    className={className}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      textAlign: 'center',
      color,
      background: 'rgba(24,24,27,0.92)',
      zIndex: 2000,
      padding: '8px 0',
      fontWeight: 600,
      fontSize: 'clamp(16px, 4vw, 22px)',
      ...style,
    }}
  >
    {message}
  </div>
);

export default ErrorBanner; 