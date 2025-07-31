import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';

import './styles/avalon/avalon-theme.css';

import StoneEmberProgressBar from './styles/avalon/GlowingRuneProgressBar';

import useWakeLock from './services/useWakeLock';

import AvalonBoard from './AvalonBoard.jsx';
import PlayerList from './PlayerList.jsx';
import { PlayerNameModal } from './Modals';
import ErrorBanner from './ErrorBanner.jsx';

import { generateGUID, generateTabId, getGamePlayerLimits } from './utils.js';
import { getGameImages } from "./assets.js";

const AvalonPreGameSetup = ({ 
    isHost, 
    selectedCharacters, 
    setSelectedCharacters, 
    firstPlayerFlagActive, 
    setFirstPlayerFlagActive, 
    gameImages 
}) => {
    // Special characters for Avalon
    const AVALON_CHARACTERS = [
        { id: 'merlin',   name: 'Merlin',   background: '50% 50% / 120% no-repeat', borderColor: '#317c9c' },
        { id: 'assassin', name: 'Assassin', background: '50% 35% / 120% no-repeat', borderColor: '#712a10' },
        { id: 'percival', name: 'Percival', background: '55% 15% / 110% no-repeat', borderColor: '#317c9c' },
        { id: 'morgana',  name: 'Morgana',  background: '40% 0% / 100% no-repeat', borderColor: '#712a10' },
        { id: 'mordred',  name: 'Mordred',  background: '50% 50% / 100% no-repeat', borderColor: '#712a10' },
        { id: 'oberon',   name: 'Oberon',   background: '50% 30% / 130% no-repeat', borderColor: '#712a10' },
    ];
    const handleCharacterToggle = (characterId) => {
        // First 2 characters (merlin, assassin) cannot be toggled
        if (characterId === 'merlin' || characterId === 'assassin') {
            return;
        }
        
        setSelectedCharacters(prev => {
            if (prev.includes(characterId)) {
                return prev.filter(id => id !== characterId);
            } else {
                return [...prev, characterId];
            }
        });
    };

    const handleFlagToggle = () => {
        setFirstPlayerFlagActive(prev => !prev);
    };

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            {/* Host Rules Section */}
            {isHost && (
                <div style={{ 
                    marginBottom: '1rem', 
                    padding: '1rem', 
                    background: 'rgba(27,22,21,0.8)', 
                    borderRadius: '10px',
                    border: '1px solid #7c5a1a',
                    color: '#e0c97f',
                    // fontSize: 'clamp(0.85rem, 2.3vw, 1rem)',
                    fontSize: 'clamp(0.80rem, 2.0vw, 0.95rem)',
                    lineHeight: 1.4
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#bfa76f', textAlign: 'left' }}>
                        As a host, you may:
                    </div>
                    <div style={{ textAlign: 'left' }}>• Select additional special characters (Merlin and Assassin are always included)</div>
                    <div style={{ textAlign: 'left', marginTop: '0.3rem' }}>• Sort players by seating and play order</div>
                    <div style={{ textAlign: 'left', marginTop: '0.3rem' }}>• Uncheck the flag next to Player 1 to randomly assign the first mission leader</div>
                </div>
            )}

            {/* Special Characters Grid */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                width: '100%',
                maxWidth: '500px',
                margin: '0 auto 1rem auto',
                padding: '0 1rem',
                boxSizing: 'border-box'
            }}>
                {AVALON_CHARACTERS.map((character, index) => {
                    const isSelected = selectedCharacters.includes(character.id);
                    const isLocked = character.id === 'merlin' || character.id === 'assassin';
                    const characterImage = gameImages[character.id]; //|| gameImages.oberon; // fallback to oberon
                    
                    return (
                        <div
                            key={character.id}
                            onClick={() => isHost && !isLocked && handleCharacterToggle(character.id)}
                            style={{
                                position: 'relative',
                                width: '14.5%',
                                aspectRatio: '1',
                                borderRadius: '50%',
                                // border: '2px solid #555',
                                border: `2px solid ${character.borderColor}`,
                                background: `url(${characterImage}) ${character.background}`, //center/cover
                                // backgroundSize: '70%',
                                // backgroundPosition: '50% 0',
                                // backgroundRepeat: 'no-repeat',
                                backgroundColor: 'rgba(72,43,39,0.93)',
                                
                                cursor: isHost && !isLocked ? 'pointer' : 'default',
                                opacity: isHost ? 1 : 0.7,
                                transition: 'all 0.2s ease',
                                ...(isHost && !isLocked && {
                                    ':hover': {
                                        borderColor: '#bfa76f',
                                        transform: 'scale(1.05)'
                                    }
                                })
                            }}
                        >
                            {/* Selection indicator */}
                            {isSelected && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-5px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '20px',
                                    height: '20px',
                                    background: '#4CAF50',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    border: '2px solid #fff'
                                }}>
                                    ✓
                                </div>
                            )}
                            
                            {/* Locked indicator for first 2 characters */}
                            {isLocked && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-5px',
                                    right: '-5px',
                                    width: '16px',
                                    height: '16px',
                                    background: '#bfa76f',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                    color: '#1b1615'
                                }}>
                                    🔒
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

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
                    <div style={{ flex: 1, maxWidth: "500px" }}>
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

                                {rightAmountOfPlayers ? (
                                    <>
                                        {isHost ? (
                                        <div style={{display: 'flex', justifyContent: 'center', marginTop: '1.5rem'}}>
                                            <button className={isAvalon ? 'button' : ''} onClick={sendStartGame}>Start Game</button>
                                        </div>
                                        ) : (
                                        <div style={{marginTop: '1.7rem', color: '#e57373'}}>
                                            <h3 style={{color: '#e57373'}}>
                                            {isAvalon ? `Host quiet. Game not yet begun` : `Waiting for the host to start the game`}
                                            </h3>
                                        </div>
                                        )}
                                    </>
                                    ) : (
                                    <div style={{marginTop: '1.7rem', color: '#e57373'}}>
                                        <h3 style={{color: '#e57373'}}>
                                        {isAvalon ? `The game Avalon requireth a company of ` : `The game ${gameName[0].toUpperCase() + gameName.slice(1)} requires `}
                                        {minPlayers} to {maxPlayers}
                                        {!isAvalon && ` people`}
                                        </h3>    
                                    </div>
                                )}

                                <h3 style={{fontSize: '1.4rem'}}>Code: &nbsp; <span style={{fontFamily: 'Cinzel, serif', fontSize: '1.25rem'}}>{partyCode}</span></h3>
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