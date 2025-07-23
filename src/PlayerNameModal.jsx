import React, { useState } from 'react';

const PlayerNameModal = ({ visible, onSubmit, initialButton, onCancel, gameName }) => {
  const [name, setName] = useState('');
  const maxLen = 10;
  if (!visible) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className={gameName + '-modal-bg'}>
        <div className={gameName + '-modal-title'} style={{ color: '#e0c97f', fontSize: '1.3rem', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#e0c97f" style={{marginRight: 4}}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"/></svg>
          Enter your name
        </div>
        <input
          type="text"
          value={name}
          maxLength={maxLen}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onSubmit(name.trim()); }}
          placeholder="Your name"
          className={gameName + '-modal-input'}
        />
        <div className={gameName + '-modal-hint'} style={{ fontFamily: 'Lancelot, Cinzel, serif', fontSize: '1.05rem', color: '#e0c97f', textTransform: 'capitalize' }}>
          Max {maxLen} characters
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12 }}>
          <button className={gameName ? 'button' : ''} style={{ width: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { if (name.trim()) onSubmit(name.trim()); }}>{initialButton}</button>
          {onCancel && <button className={gameName ? 'button' : ''} style={{ width: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onCancel}>Cancel</button>}
        </div>
      </div>
    </div>
  );
};

export default PlayerNameModal; 