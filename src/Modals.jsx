import React, { useState } from 'react';

const PlayerNameModal = ({ visible, onSubmit, initialButton, onCancel, gameName }) => {
  const [name, setName] = useState('');
  const maxLen = 10;
  if (!visible) return null;
  return (
    <div className='modal'>
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

const JoinPartyModal = ({ visible, onSubmit, onCancel, isAvalon, gameName }) => {
  const [code, setCode] = useState('');
  if (!visible) return null;
  return (
    <div className='modal'>
      <div className={gameName + '-modal-bg'}>
        <div className={gameName + '-modal-title'}>Enter 4-digit Party Code</div>
        <input
          type="text"
          value={code}
          maxLength={4}
          onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
          onKeyDown={e => { if (e.key === 'Enter' && code.length === 4) onSubmit(code); }} 
          placeholder="1234"
          className={gameName + '-modal-input'}
          style={{ fontSize: 18, padding: 8, width: '80%', letterSpacing: 4, textAlign: 'center' }}
        />
        <div style={isAvalon ? { display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12 } : {}}>
          <button className={isAvalon ? 'button' : ''} style={isAvalon ? { width: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' } : { margin: 8 }} onClick={() => { if (code.length === 4) onSubmit(code); }}>Join</button>
          {onCancel && <button className={isAvalon ? 'button' : ''} style={isAvalon ? { width: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' } : { margin: 8 }} onClick={onCancel}>Cancel</button>}
        </div>
      </div>
    </div>
  );
};

export { PlayerNameModal, JoinPartyModal }; 