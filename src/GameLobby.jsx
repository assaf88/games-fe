import React, { useState, useEffect } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import ErrorBanner from './ErrorBanner.jsx';
import { PlayerNameModal, JoinPartyModal } from './Modals';
import StoneEmberProgressBar from './styles/avalon/GlowingRuneProgressBar';
import './styles/avalon/avalon-theme.css';
import { generateGUID } from './utils.js';

import { getGameImages } from './assets';

const GameLobby = () => {
  const location = useLocation();
  const gameName = location.pathname.split('/')[1];
  const isAvalon = gameName === 'avalon' || gameName === '';

  useEffect(() => {
    const gameImages = Object.values(getGameImages(gameName));

    const links = gameImages.map(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
      return link;
    });
    return () => links.forEach(link => document.head.removeChild(link));
  }, []);

  const navigate = useNavigate();
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'create' or 'join'
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [bannerError, setBannerError] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [partyError, setPartyError] = useState(null); // for redirect error
  const [lastEnteredCode, setLastEnteredCode] = useState('');

  useEffect(() => {
    if (location.state?.partyError) {
      setBannerError(location.state.partyError);
      setLastEnteredCode(location.state.partyCode);
      setShowJoinModal(true);
      // Clear the state so it doesn't persist, 50 ms delay to ensure the modal is open
      setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 50);
    }
  }, [location, navigate]);

  // Check if player info exists
  const getPlayerInfo = () => {
    const id = localStorage.getItem('player_id');
    const name = localStorage.getItem('player_name');
    return id && name ? { id, name } : null;
  };

  // const isAvalon = location.pathname.includes('avalon') || location.pathname === '/';

  const handleCreate = async () => {
    if (!getPlayerInfo()) {
      setPendingAction('create');
      setShowNameModal(true);
      return;
    }
    setBannerError(null);
    setLoading(true);
    try {
      const player = getPlayerInfo();
      const res = await fetch(`/game/${gameName}/create-party`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: player.id, name: player.name })
      });
      let data = {};
      try {
        data = await res.json();
      } catch {}
      if (!res.ok || !data.partyCode) {
        if (res.status === 502) {
          setBannerError('Disconnected. Please try again.');
        } else {
          setBannerError(data.error || 'Failed to create party');
        }
        setLoading(false);
        return;
      }
      setBannerError(null);
      navigate(`${location.pathname.replace(/\/$/, '')}/party/${data.partyCode}`);
    } catch (e) {
      setBannerError('Disconnected');
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
    setLastEnteredCode(code);
    setShowJoinModal(false);
    setBannerError(null);
    // Retry logic
    const retryKey = 'join_retries';
    const now = Date.now();
    let retries = JSON.parse(localStorage.getItem(retryKey) || '[]').filter(ts => now - ts < 60 * 60 * 1000);
    if (retries.length >= 10) {
      setBannerError('Too many join attempts. Please try again later.');
      return;
    }
    // Try to open a WebSocket connection to check if party exists
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${wsProtocol}://${window.location.host}/game/${gameName}/party/${encodeURIComponent(code)}`;
    let ws;
    let didNavigate = false;
    try {
      ws = new window.WebSocket(wsUrl);
      ws.onopen = () => {
        ws.close();
        if (!didNavigate) {
          didNavigate = true;
          retries.push(now);
          localStorage.setItem(retryKey, JSON.stringify(retries));
          setBannerError(null);
          navigate(`${location.pathname.replace(/\/$/, '')}/party/${code}`);
        }
      };
      // ws.onmessage = (event) => {
      //   try {
      //     const data = JSON.parse(event.data);
      //     // if (data && data.action === 'error' && data.reason === 'party_not_found') {
      //     //   setBannerError('Party not found.');
      //     //   // Reopen modal with the wrong code
      //     //   setShowJoinModal(true);
      //     // }
      //     if (data && data.action === 'error' && data.reason === 'connection_replaced') {
      //       setBannerError('A newer tab has connected to this party. You can close this page.');
      //     }
      //   } catch {}
      // };
      ws.onerror = () => {
        setBannerError('Disconnected or party not found. Please try again.');
        retries.push(now);
        localStorage.setItem(retryKey, JSON.stringify(retries));
        // Reopen modal with the wrong code
        setShowJoinModal(true);
      };
    } catch (e) {
      setBannerError('Disconnected');
      retries.push(now);
      localStorage.setItem(retryKey, JSON.stringify(retries));
      // Reopen modal with the wrong code
      setShowJoinModal(true);
    }
  };

  return (
    <div className="avalon-lobby">
      {bannerError && <ErrorBanner message={bannerError} color="red" />}
      {loading && isAvalon ? (
        <div className="avalon-loading-container">
          <StoneEmberProgressBar duration={3.0} />
          <div className="avalon-loading-message">Creating party…</div>
        </div>
      ) : (
        <>
          <h1 className={gameName + '-heading'}>{gameName.charAt(0).toUpperCase() + gameName.slice(1)}</h1>
          <div className={gameName + '-lobby-intro'}>
          Brave souls are sent forth on quests, one by one. <br />
          Each folk bears a secret part—some true, some false. 
          Words are weighed and glances kept to find false hearts. 
          The game turns on trust, guile, and wise counsel. 
          Godspeed, may good fortune favor thy journey.
          </div>
          <div className={gameName + '-lobby-buttons'}>
            {/*todo: in the next game styling we add- put all styles to css and find their class by gameName + the rest of the class name like above*/}
            <button className={isAvalon ? 'button' : ''} style={isAvalon ? { width: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}} onClick={handleCreate}>Create</button>
            <button className={isAvalon ? 'button' : ''} style={isAvalon ? { width: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' } : { marginLeft: 12 }} onClick={handleJoin}>Join</button>
          </div>
          {/* Remove all inline error divs, all errors are now in the banner */}
          <PlayerNameModal
            visible={showNameModal}
            onSubmit={handleNameSubmit}
            initialButton={pendingAction === 'create' ? 'Create' : 'Join'}
            onCancel={() => setShowNameModal(false)}
            gameName={gameName}
          />
          <JoinPartyModal
            visible={showJoinModal}
            onSubmit={handleJoinCodeSubmit}
            onCancel={() => setShowJoinModal(false)}
            isAvalon={isAvalon}
            gameName={gameName}
            initialCode={lastEnteredCode}
          />
        </>
      )}
    </div>
  );
};

export default GameLobby; 