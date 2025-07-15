import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import StoneEmberProgressBar from './styles/avalon/GlowingRuneProgressBar';
import './styles/avalon/avalon-theme.css';

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

const JoinPartyModal = ({ visible, onSubmit, onCancel, isAvalon, gameName }) => {
  const [code, setCode] = useState('');
  if (!visible) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className={gameName + '-modal-bg'}>
        <div className={gameName + '-modal-title'}>Enter 4-digit Party Code</div>
        <input
          type="text"
          value={code}
          maxLength={4}
          onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
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

const GameLobby = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'create' or 'join'
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [error, setError] = useState(null);
  const [joinError, setJoinError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if player info exists
  const getPlayerInfo = () => {
    const id = localStorage.getItem('player_id');
    const name = localStorage.getItem('player_name');
    return id && name ? { id, name } : null;
  };

  // const isAvalon = location.pathname.includes('avalon') || location.pathname === '/';
  const gameName = location.pathname.split('/')[1];
  const isAvalon = gameName === 'avalon' || gameName === '';

  const handleCreate = async () => {
    if (!getPlayerInfo()) {
      setPendingAction('create');
      setShowNameModal(true);
      return;
    }
    setError(null);
    setLoading(true);
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
        setLoading(false);
        return;
      }
      // Wait for the player list to be loaded before navigating
      // const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      // const wsUrl = `${wsProtocol}://${window.location.host}/game/party/${encodeURIComponent(data.partyId)}`;
      // let ws;
      // let navigated = false;
      // ws = new window.WebSocket(wsUrl);
      // ws.onopen = () => {
      //   const playerId = localStorage.getItem('player_id');
      //   const playerName = localStorage.getItem('player_name');
      //   if (playerId && playerName) {
      //     ws.send(JSON.stringify({ action: "register", id: playerId, name: playerName }));
      //   }
      // };
      // ws.onmessage = (event) => {
      //   try {
      //     const messageData = JSON.parse(event.data);
      //     if (messageData.action === "update_state" && !navigated) {
      //       navigated = true;
      //       ws.close();
      //       setTimeout(() => {
      //         setLoading(false);
              navigate(`${location.pathname.replace(/\/$/, '')}/party/${data.partyId}`);
      //       }, 0);
      //     }
      //   } catch {}
      // };
      // ws.onerror = () => {
      //   setError('Failed to connect to party.');
      //   setLoading(false);
      // };
    } catch (e) {
      setError('Failed to create party.');
      setLoading(false);
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
    <div className={gameName + '-bg'}>
      {loading && isAvalon ? (
        <div className="avalon-loading-container">
          <StoneEmberProgressBar />
          <div className="avalon-loading-message">Creating party…</div>
        </div>
      ) : (
        <>
          <h1 className={gameName + '-heading'}>{gameName.charAt(0).toUpperCase() + gameName.slice(1)} Game</h1>
          <div style={isAvalon ? { display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 16 } : {}}>
            {/*todo: in the next game styling we add- put all styles to css and find their class by gameName + the rest of the class name like above*/}
            <button className={isAvalon ? 'button' : ''} style={isAvalon ? { width: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}} onClick={handleCreate}>Create</button>
            <button className={isAvalon ? 'button' : ''} style={isAvalon ? { width: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' } : { marginLeft: 12 }} onClick={handleJoin}>Join</button>
          </div>
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
            isAvalon={isAvalon}
            gameName={gameName}
          />
          {joinError && <div style={{ color: 'red', margin: 8 }}>{joinError}</div>}
        </>
      )}
    </div>
  );
};

export default GameLobby; 