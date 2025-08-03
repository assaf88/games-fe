import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';

import './styles/avalon/avalon-theme.css';

import StoneEmberProgressBar from './styles/avalon/GlowingRuneProgressBar';

import useWakeLock from './services/useWakeLock';

import AvalonBoard from './AvalonBoard.jsx';
import PlayerList from './PlayerList.jsx';
import { PlayerNameModal } from './Modals';
import ErrorBanner from './ErrorBanner.jsx';
import AvalonPreGameSetup from './AvalonPreGameSetup.jsx';

import { generateGUID, generateTabId, getGamePlayerLimits } from './utils.js';
import { getGameImages } from "./assets.js";



const getLocalPlayerId = () => localStorage.getItem('player_id');

const GameParty = () => {
    const { id: partyCode } = useParams();
    const navigate = useNavigate();
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
    const isVertical = window.innerHeight > window.innerWidth; 
    const gameName = location.pathname.split('/')[1];
    const gameImages = getGameImages(gameName);
    const isAvalon = gameName === 'avalon' || gameName === '';
    const { minPlayers, maxPlayers } = getGamePlayerLimits(gameName);
    const [showNameModal, setShowNameModal] = useState(!localStorage.getItem('player_name')); //for users that came directly to the party page
    const [pendingName, setPendingName] = useState('');
    const [disconnected, setDisconnected] = useState(false);
    const [duplicateConnection, setDuplicateConnection] = useState(false);
    
    // Avalon pre-game setup state
    const [selectedCharacters, setSelectedCharacters] = useState(['merlin', 'assassin']); // First 2 always selected
    const [firstPlayerFlagActive, setFirstPlayerFlagActive] = useState(true);
    
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
        const wsUrl = `${wsProtocol}://${window.location.host}/game/${gameName}/party/${encodeURIComponent(partyCode)}`;
        let attempt = 0;
        let isConnected = false;
        let hasRedirected = false;

        const connectWebSocket = () => {
            if (isUnmounted || hasRedirected) return;
            setReconnecting(attempt > 0);
            setReconnectAttempts(attempt);
            setReconnectFailed(false);
            websocket.current = new WebSocket(wsUrl);
            const ws = websocket.current;

            ws.onopen = () => {
                setReconnecting(false);
                setReconnectFailed(false);
                setReconnectAttempts(0); // Reset attempts on successful connect
                setDisconnected(false); // Remove disconnected banner on connect
                attempt = 0;
                isConnected = true;
                console.log("WebSocket connected!");
                const playerId = localStorage.getItem('player_id');
                const playerName = localStorage.getItem('player_name');
                if (playerId && playerName) {
                    const tabId = generateTabId();
                    ws.send(JSON.stringify({ action: "register", id: playerId, name: playerName, tabId: tabId }));
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
                if (messageData && messageData.action === 'error') {
                    if (messageData.reason === 'party_not_found') {
                        navigate('/avalon', { state: { partyError: 'Party not found.', partyCode: partyCode } });
                        hasRedirected = true;
                        return;
                    }
                    if (messageData.reason === 'game_started') {
                        navigate('/avalon', { state: { partyError: 'The game has already started.' } });
                        hasRedirected = true;
                        return;
                    }
                    if (messageData.reason === 'connection_replaced') {
                        setDuplicateConnection(true);
                        hasRedirected = true;
                        return;
                    }
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
                    
                    // Sync Avalon pre-game setup state for non-host players
                    if (isAvalon && !isHost && messageData.selectedCharacters) {
                        setSelectedCharacters(messageData.selectedCharacters);
                    }
                    if (isAvalon && !isHost && messageData.firstPlayerFlagActive !== undefined) {
                        setFirstPlayerFlagActive(messageData.firstPlayerFlagActive);
                    }
                }
                if (messageData.action === "avalon_setup_update" && !isHost) {
                    if (messageData.selectedCharacters) {
                        setSelectedCharacters(messageData.selectedCharacters);
                    }
                    if (messageData.firstPlayerFlagActive !== undefined) {
                        setFirstPlayerFlagActive(messageData.firstPlayerFlagActive);
                    }
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
                if (hasRedirected) return; // Prevent reconnect if redirected due to error
                if (event.code === 1005 && !event.reason) {
                    setDisconnected(true);
                }
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
    }, [partyCode, showNameModal]);

    // Send Avalon setup updates when host changes settings
    useEffect(() => {
        if (isHost && isAvalon && !gameState.gameStarted) {
            sendAvalonSetupUpdate();
        }
    }, [selectedCharacters, firstPlayerFlagActive, isHost, isAvalon, gameState.gameStarted]);

    const sendStartGame = () => {
        if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
            const startGameData = {
                action: "start_game"
            };
            
            if (isAvalon) {
                startGameData.selectedCharacters = selectedCharacters;
                startGameData.firstPlayerFlagActive = firstPlayerFlagActive;
            }
            
            websocket.current.send(JSON.stringify(startGameData));
        }
    };

    const sendAvalonSetupUpdate = () => {
        if (websocket.current && websocket.current.readyState === WebSocket.OPEN && isHost) {
            websocket.current.send(JSON.stringify({
                action: "avalon_setup_update",
                selectedCharacters: selectedCharacters,
                firstPlayerFlagActive: firstPlayerFlagActive
            }));
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

    // Check if current user is disconnected
    // const selfPlayer = gameState.players.find(p => p.id === selfId);
    // const isSelfDisconnected = selfPlayer && selfPlayer.connected === false;

    // Handler to update player order and send to backend
    function handleOrderChange(newPlayers) {
        setGameState(prev => ({ ...prev, players: newPlayers }));
        if (isHost) {
            if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
                websocket.current.send(JSON.stringify({ action: 'update_order', players: newPlayers.map(p => ({ id: p.id, order: p.order })) }));
            }
        }
    }

    const connectedPlayers = gameState.players.filter(p => p.connected).length;
    const rightAmountOfPlayers = connectedPlayers >= minPlayers && connectedPlayers <= maxPlayers;

    return (
        <div className="avalon-party">
            <PlayerNameModal
                visible={showNameModal}
                onSubmit={handleNameSubmit}
                initialButton="Join"
                onCancel={() => navigate('/avalon')}
                gameName={gameName}
            />
            {reconnectAttempts > 0 && !reconnectFailed && (
                <ErrorBanner
                    message={`Reconnecting... (attempt ${reconnectAttempts})`}
                    color="orange"
                />
            )}
            {reconnectFailed && (
                <ErrorBanner
                    message="Connection lost. Please refresh the page."
                    color="red"
                />
            )}
            {disconnected && (
                <ErrorBanner
                    message="Disconnected"
                    color="red"
                />
            )}
            {duplicateConnection && (
                <ErrorBanner
                    message="A newer tab has connected to this party. You can close this page."
                    color="orange"
                />
            )}
            {/* {isSelfDisconnected && (
                <ErrorBanner
                    message="You are disconnected. Please refresh the page."
                    color="red"
                />
            )} */}
            {loading && isAvalon ? (
                <div className="avalon-loading-container">
                    <StoneEmberProgressBar duration={3.0} />
                    <div className="avalon-loading-message">Joining party…</div>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "center" }}>
                    <div className="party-pre-game-start" style={{width: `${isVertical ? window.innerWidth : '100%'}`}}>
                        {/* Show only gameState.players before game starts; show poker circle after */}
                        {!gameState.gameStarted ? (
                            <>
                            {/* Avalon Pre-Game Setup */}
                            {isAvalon && !gameState.gameStarted && (
                                <AvalonPreGameSetup
                                    isHost={isHost}
                                    selectedCharacters={selectedCharacters}
                                    setSelectedCharacters={setSelectedCharacters}
                                    firstPlayerFlagActive={firstPlayerFlagActive}
                                    setFirstPlayerFlagActive={setFirstPlayerFlagActive}
                                    gameImages={gameImages}
                                    isVertical={isVertical}
                                />
                            )}

                            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: 500, minWidth: 220 }}>
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
                                        firstPlayerFlagActive={firstPlayerFlagActive}
                                        onFlagToggle={() => setFirstPlayerFlagActive(prev => !prev)}
                                    />
                                </div>
                            </div>

                            <div style={{fontSize: '1.0rem'}}>
                                {rightAmountOfPlayers ? (
                                    <>
                                        {isHost ? (
                                        <div style={{display: 'flex', justifyContent: 'center', marginTop: `${isVertical ? '0.3rem' : '1.5rem'}`, scale: `${isVertical ? '0.90' : '1'}`}}>
                                            <button className={isAvalon ? 'button' : ''} onClick={sendStartGame}>Start Game</button>
                                        </div>
                                        ) : (
                                        <div style={{marginTop: '1.1rem', color: '#e57373', }}>
                                            <h3 style={{color: '#e57373'}}>
                                            {isAvalon ? `Host quiet. Game not yet begun` : `Waiting for the host to start the game`}
                                            </h3>
                                        </div>
                                        )}
                                    </>
                                    ) : (
                                    <div style={{marginTop: '1.1rem', color: '#e57373'}}>
                                        <h3 style={{color: '#e57373'}}>
                                        {isAvalon ? `The game Avalon requireth a company of ` : `The game ${gameName[0].toUpperCase() + gameName.slice(1)} requires `}
                                        {minPlayers} to {maxPlayers}
                                        {!isAvalon && ` people`}
                                        </h3>    
                                    </div>
                                )}

                                <h3 style={{...(isVertical && gameState.players.length > 9 ? {fontSize: '1.4rem', scale: '0.6', marginTop: '-1rem'} : {fontSize: '1.4rem', marginTop: '0', scale: `${isVertical ? '0.9' : '1'}` })}}>
                                    Code: &nbsp; <span style={{fontFamily: 'Cinzel, serif', fontSize: '1.25rem'}}>{partyCode}</span>
                                </h3>
                            </div>
                        </>
                        ) : null}
                    </div>
                    <AvalonBoard
                        players={gameState.players}
                        hostId={gameState.hostId}
                        gameStarted={!!gameState.gameStarted}
                        gameStarting={!!gameState.gameStarting}
                        images={gameImages}
                    />
                </div>
            )}
        </div>
    );
};

export default GameParty; 