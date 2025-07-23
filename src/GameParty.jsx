import { useRef, useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import './styles/avalon/avalon-theme.css';
import StoneEmberProgressBar from './styles/avalon/GlowingRuneProgressBar';
import useWakeLock from './services/useWakeLock';
import PlayerList from './PlayerList.jsx';
import PlayerNameModal from './PlayerNameModal.jsx';

const getLocalPlayerId = () => localStorage.getItem('player_id');

const GameParty = () => {
    const { id: partyId } = useParams();
    const websocket = useRef(null);
    const [gameState, setGameState] = useState({
        players: [],
        hostId: null,
        gameStarted: false,
    });
    const [reconnecting, setReconnecting] = useState(false);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const [reconnectFailed, setReconnectFailed] = useState(false);
    // No loading animation here; handled in lobby
    const maxReconnectAttempts = 10;
    const isHost = getLocalPlayerId() && gameState.hostId && getLocalPlayerId() === gameState.hostId;
    const location = window.location;
    const gameName = location.pathname.split('/')[1];
    const isAvalon = gameName === 'avalon' || gameName === '';
    const avalonMinPlayers = 3;
    const avalonMaxPlayers = 10;
    const [showNameModal, setShowNameModal] = useState(!localStorage.getItem('player_name')); //for users that came directly to the party page
    const [pendingName, setPendingName] = useState('');
    
    useWakeLock();

    // Handler for name submit
    const handleNameSubmit = (name) => {
        const id = generateGUID();
        localStorage.setItem('player_id', id);
        localStorage.setItem('player_name', name);
        setShowNameModal(false);
    };

    // Only connect if name is set
    useEffect(() => {
        if (showNameModal) return;
        let isUnmounted = false;
        let reconnectTimeoutId = null;
        const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
        const wsUrl = `${wsProtocol}://${window.location.host}/game/party/${encodeURIComponent(partyId)}`;
        let attempt = 0;
        let isConnected = false;

        const connectWebSocket = () => {
            if (isUnmounted) return;
            setReconnecting(attempt > 0);
            setReconnectAttempts(attempt);
            setReconnectFailed(false);
            websocket.current = new WebSocket(wsUrl);
            const ws = websocket.current;

            ws.onopen = () => {
                setReconnecting(false);
                setReconnectFailed(false);
                attempt = 0;
                isConnected = true;
                console.log("WebSocket connected!");
                const playerId = localStorage.getItem('player_id');
                const playerName = localStorage.getItem('player_name');
                if (playerId && playerName) {
                    ws.send(JSON.stringify({ action: "register", id: playerId, name: playerName }));
                }
            };

            ws.onmessage = (event) => {
                let rawData = event.data;
                let messageData;
                try {
                    console.log("WebSocket message received:", rawData);
                    messageData = JSON.parse(rawData);
                } catch (err) {
                    console.error("Failed to parse WebSocket message:", rawData, err);
                }
                if (messageData.action === "update_state") {
                    setGameState(prev => {
                        const newState = {
                            ...prev,
                            ...messageData,
                            players: messageData.players || [],
                            hostId: messageData.hostId || null,
                            gameStarted: messageData.gameStarted || false,
                            gameStarting: messageData.gameStarting || false,
                        };
                        console.log('Updated gameState:', newState);
                        return newState;
                    });
                }
                if (messageData.action === 'ping') {
                    ws.send(JSON.stringify({ action: 'pong' }));
                }
            };

            ws.onerror = (err) => {
                console.error("WebSocket error:", err);
            };

            ws.onclose = (event) => {
                console.log("WebSocket closed:", event.reason || "No reason provided");
                console.log(`Socket closed with code: ${event.code}, reason: ${event.reason}`);
                isConnected = false;
                if (!isUnmounted && attempt < maxReconnectAttempts) {
                    const delay = 10000; // 10 seconds for every attempt
                    attempt++;
                    console.log(`Reconnecting WebSocket in ${delay / 1000}s... (attempt ${attempt})`);
                    reconnectTimeoutId = setTimeout(connectWebSocket, delay);
                } else if (!isUnmounted) {
                    setReconnecting(false);
                    setReconnectFailed(true);
                }
            };
        };

        connectWebSocket();

        // Auto-retry on visibility change (screen wake/unlock)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && !isConnected && !reconnecting && !reconnectFailed) {
                attempt = 0;
                connectWebSocket();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            isUnmounted = true;
            if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
                websocket.current.close();
            }
            if (reconnectTimeoutId) clearTimeout(reconnectTimeoutId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [partyId, showNameModal]);

    const sendStartGame = () => {
        if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
            websocket.current.send(JSON.stringify({ action: "start_game" }));
        }
    };

    // Show immersive loading bar while waiting for player list after joining a party
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (gameState.players && gameState.players.length > 0) {
            setLoading(false);
        }
    }, [gameState.players]);

    const selfId = getLocalPlayerId();

    // Handler to update player order and send to backend
    function handleOrderChange(newPlayers) {
        setGameState(prev => ({ ...prev, players: newPlayers }));
        if (isHost) {
            if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
                websocket.current.send(JSON.stringify({ action: 'update_order', players: newPlayers.map(p => ({ id: p.id, order: p.order })) }));
            }
        }
    }

    return (
        <div className="avalon-party">
            <PlayerNameModal
                visible={showNameModal}
                onSubmit={handleNameSubmit}
                initialButton="Join"
                onCancel={null}
                gameName={gameName}
            />
            {(reconnecting || reconnectFailed) && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', textAlign: 'center', color: reconnectFailed ? 'red' : 'orange', background: 'rgba(24,24,27,0.92)', zIndex: 2000, padding: '8px 0', fontWeight: 600, fontSize: 'clamp(16px, 4vw, 22px)' }}>
                    {reconnectFailed
                        ? 'Reconnecting failed. Please refresh the page.'
                        : `Reconnecting... (attempt ${reconnectAttempts})`}
                </div>
            )}
            {loading && isAvalon ? (
                <div className="avalon-loading-container">
                    <StoneEmberProgressBar duration={3.0} />
                    <div className="avalon-loading-message">Joining party…</div>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "center" }}>
                    <div style={{ flex: 1, maxWidth: "500px" }}>
                        {/* Show only gameState.players before game starts; show poker circle after */}
                        {!gameState.gameStarted ? (
                            <>
                                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '96vw', maxWidth: 430, minWidth: 220 }}>
                                    {/* Golden frame with border radius */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 3, left: 3, right: 3, bottom: 3,
                                        border: '7px solid #7c5a1a',
                                        borderRadius: 39,
                                        boxSizing: 'border-box',
                                        zIndex: 0,
                                        pointerEvents: 'none',
                                    }}>
                                        {/* Corner dots */}
                                        <div style={{ position: 'absolute', top: 12, left: 12, width: 16, height: 16, background: '#bfa76f', borderRadius: '50%' }} />
                                        <div style={{ position: 'absolute', top: 12, right: 12, width: 16, height: 16, background: '#bfa76f', borderRadius: '50%' }} />
                                        <div style={{ position: 'absolute', bottom: 12, left: 12, width: 16, height: 16, background: '#bfa76f', borderRadius: '50%' }} />
                                        <div style={{ position: 'absolute', bottom: 12, right: 12, width: 16, height: 16, background: '#bfa76f', borderRadius: '50%' }} />
                                    </div>
                                    {/* PlayerList content */}
                                    <div style={{
                                        position: 'relative',
                                        zIndex: 1,
                                        width: '100%',
                                        padding: '0.5rem 1.0rem 1.0rem 0rem',
                                        background: 'rgba(27,22,21,0.93)',
                                        borderRadius: 39,
                                        boxShadow: '0 0 12px 6px rgba(41, 31, 25, 0.93)',
                                        
                                        color: '#e0c97f',
                                        boxSizing: 'border-box',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                    }}>
                                        <PlayerList
                                            players={gameState.players}
                                            selfId={selfId}
                                            hostId={gameState.hostId}
                                            isAvalon={isAvalon}
                                            onOrderChange={handleOrderChange}
                                        />
                                    </div>
                                </div>
                                {isAvalon && gameState.players.length < avalonMinPlayers && (
                                    <div style={{marginTop: '1.7rem', color: '#e57373'}}>
                                        <h3 style={{color: '#e57373'}}>The game Avalon requireth a company of {avalonMinPlayers} to {avalonMaxPlayers}</h3>
                                    </div>
                                )}
                                {!isHost && gameState.players.length >= avalonMinPlayers && (
                                    <div style={{marginTop: '1.7rem', color: '#e57373'}}>
                                        <h3 style={{color: '#e57373'}}>Host quiet. Game not yet begun</h3>
                                    </div>
                                )}
                                {isHost && gameState.players.length >= avalonMinPlayers &&(
                                    <div style={{display: 'flex', justifyContent: 'center', marginTop: '1.5rem'}}>
                                        <button className={isAvalon ? 'button' : ''} onClick={sendStartGame}>Start
                                            Game
                                        </button>
                                    </div>
                                )}
                                <h3 style={{fontSize: '1.4rem'}}>Code: &nbsp; <span style={{fontFamily: 'Cinzel, serif', fontSize: '1.25rem'}}>{partyId}</span></h3>
                            </>
                        ) : null}
                    </div>
                    <div className="poker-circle-container" style={{ flex: 1, display: gameState.gameStarted ? "flex" : "none", justifyContent: "center", alignItems: "center" }}>
                        <AvalonBoard players={gameState.players} hostId={gameState.hostId} gameStarting={gameState.gameStarting} />
                    </div>
                </div>
            )}
        </div>
    );
};

import AvalonBoard from './AvalonBoard.jsx';

export default GameParty; 