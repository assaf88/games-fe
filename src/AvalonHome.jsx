import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const AvalonHome = () => {
  const navigate = useNavigate();
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'create' or 'join'
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Check if player info exists
  const getPlayerInfo = () => {
    const id = localStorage.getItem('player_id');
    const name = localStorage.getItem('player_name');
    return id && name ? { id, name } : null;
  };

  const handleCreate = () => {
    if (!getPlayerInfo()) {
      setPendingAction('create');
      setShowNameModal(true);
      return;
    }
    // TODO: Call backend to create party and get unique partyId
    // For now, just navigate to a placeholder
    navigate(`/avalon/party/pending`); // Will be replaced after backend call
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

  const handleJoinCodeSubmit = (code) => {
    setShowJoinModal(false);
    navigate(`/avalon/party/${code}`);
  };

  return (
    <div>
      <h1>Avalon Game</h1>
      <button onClick={handleCreate}>Create</button>
      <button onClick={handleJoin} style={{ marginLeft: 12 }}>Join</button>
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
    </div>
  );
};

export default AvalonHome; 