import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function generateGUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const PlayerNameModal = ({ visible, onSubmit, initialButton, onCancel }) => {
  const [name, setName] = useState('');
  const maxLen = 10;
  if (!visible) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: 24, borderRadius: 8, minWidth: 300, textAlign: 'center' }}>
        <h2>Enter your name</h2>
        <input
          type="text"
          value={name}
          maxLength={maxLen}
          onChange={e => setName(e.target.value.replace(/[^a-zA-Z0-9_\- ]/g, ''))}
          placeholder="Your name"
          style={{ fontSize: 18, padding: 8, width: '80%' }}
        />
        <div style={{ fontSize: 12, color: '#888', margin: '8px 0' }}>
          Max {maxLen} characters
        </div>
        <button style={{ margin: 8 }} onClick={() => { if (name.trim()) onSubmit(name.trim()); }}>{initialButton}</button>
        {onCancel && <button style={{ margin: 8 }} onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
};

const JoinPartyModal = ({ visible, onSubmit, onCancel }) => {
  const [code, setCode] = useState('');
  if (!visible) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: 24, borderRadius: 8, minWidth: 300, textAlign: 'center' }}>
        <h2>Enter 4-digit Party Code</h2>
        <input
          type="text"
          value={code}
          maxLength={4}
          onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="1234"
          style={{ fontSize: 18, padding: 8, width: '80%', letterSpacing: 4, textAlign: 'center' }}
        />
        <div style={{ fontSize: 12, color: '#888', margin: '8px 0' }}>
          4 digits
        </div>
        <button style={{ margin: 8 }} onClick={() => { if (code.length === 4) onSubmit(code); }}>Join</button>
        {onCancel && <button style={{ margin: 8 }} onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
};

const GameLobby = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'create' or 'join'
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [error, setError] = useState(null);
  const [joinError, setJoinError] = useState(null);

  // Check if player info exists
  const getPlayerInfo = () => {
    const id = localStorage.getItem('player_id');
    const name = localStorage.getItem('player_name');
    return id && name ? { id, name } : null;
  };

  const handleCreate = async () => {
    if (!getPlayerInfo()) {
      setPendingAction('create');
      setShowNameModal(true);
      return;
    }
    setError(null);
    try {
      const player = getPlayerInfo();
      const res = await fetch('/game/create-party', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: player.id, name: player.name })
      });
      const data = await res.json();
      if (!res.ok || !data.partyId) {
        setError(data.error || 'Failed to create party.');
        return;
      }
      navigate(`${location.pathname.replace(/\/$/, '')}/party/${data.partyId}`);
    } catch (e) {
      setError('Failed to create party.');
    }
  };

  const handleJoin = () => {
    if (!getPlayerInfo()) {
      setPendingAction('join');
      setShowNameModal(true);
      return;
    }
    setShowJoinModal(true);
  };

  const handleNameSubmit = (name) => {
    const id = generateGUID();
    localStorage.setItem('player_id', id);
    localStorage.setItem('player_name', name);
    setShowNameModal(false);
    if (pendingAction === 'create') handleCreate();
    if (pendingAction === 'join') handleJoin();
  };

  const handleJoinCodeSubmit = async (code) => {
    setShowJoinModal(false);
    setJoinError(null);
    // Retry logic
    const retryKey = 'join_retries';
    const now = Date.now();
    let retries = JSON.parse(localStorage.getItem(retryKey) || '[]').filter(ts => now - ts < 60 * 60 * 1000);
    if (retries.length >= 10) {
      setJoinError('Too many join attempts. Please try again later.');
      return;
    }
    // Try to open a WebSocket connection to check if party exists
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${wsProtocol}://${window.location.host}/game/party/${encodeURIComponent(code)}`;
    let ws;
    let didNavigate = false;
    try {
      ws = new window.WebSocket(wsUrl);
      ws.onopen = () => {
        ws.close();
        if (!didNavigate) {
          didNavigate = true;
          // Save retry timestamps
          retries.push(now);
          localStorage.setItem(retryKey, JSON.stringify(retries));
          navigate(`${location.pathname.replace(/\/$/, '')}/party/${code}`);
        }
      };
      ws.onerror = () => {
        setJoinError('Party not found.');
        retries.push(now);
        localStorage.setItem(retryKey, JSON.stringify(retries));
      };
    } catch (e) {
      setJoinError('Party not found.');
      retries.push(now);
      localStorage.setItem(retryKey, JSON.stringify(retries));
    }
  };

  return (
    <div>
      <h1>Avalon Game</h1>
      <button onClick={handleCreate}>Create</button>
      <button onClick={handleJoin} style={{ marginLeft: 12 }}>Join</button>
      {error && <div style={{ color: 'red', margin: 8 }}>{error}</div>}
      <PlayerNameModal
        visible={showNameModal}
        onSubmit={handleNameSubmit}
        initialButton={pendingAction === 'create' ? 'Create' : 'Join'}
        onCancel={() => setShowNameModal(false)}
      />
      <JoinPartyModal
        visible={showJoinModal}
        onSubmit={handleJoinCodeSubmit}
        onCancel={() => setShowJoinModal(false)}
      />
      {joinError && <div style={{ color: 'red', margin: 8 }}>{joinError}</div>}
    </div>
  );
};

export default GameLobby; 