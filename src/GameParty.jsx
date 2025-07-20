import { useRef, useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import './styles/avalon/avalon-theme.css';
import StoneEmberProgressBar from './styles/avalon/GlowingRuneProgressBar';
import useWakeLock from './services/useWakeLock';

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
    // No loading animation here; handled in lobby
    const maxReconnectAttempts = 10;
    const isHost = getLocalPlayerId() && gameState.hostId && getLocalPlayerId() === gameState.hostId;
    const location = window.location;
    const gameName = location.pathname.split('/')[1];
    const isAvalon = gameName === 'avalon' || gameName === '';
    const avalonMinPlayers = 3;
    const avalonMaxPlayers = 10;
    
    useWakeLock();

    useEffect(() => {
        let isUnmounted = false;
        let pingIntervalId = null;
        let reconnectTimeoutId = null;
        const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
        const wsUrl = `${wsProtocol}://${window.location.host}/game/party/${encodeURIComponent(partyId)}`;
        let attempt = 0;

        const connectWebSocket = () => {
            if (isUnmounted) return;
            setReconnecting(attempt > 0);
            setReconnectAttempts(attempt);
            websocket.current = new WebSocket(wsUrl);
            const ws = websocket.current;

            ws.onopen = () => {
                setReconnecting(false);
                attempt = 0;
                console.log("WebSocket connected!");
                const playerId = localStorage.getItem('player_id');
                const playerName = localStorage.getItem('player_name');
                if (playerId && playerName) {
                    ws.send(JSON.stringify({ action: "register", id: playerId, name: playerName }));
                }
                startPing();
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
                        };
                        console.log('Updated gameState:', newState);
                        return newState;
                    });
                }
            };

            ws.onerror = (err) => {
                console.error("WebSocket error:", err);
            };

            ws.onclose = (event) => {
                console.log("WebSocket closed:", event.reason || "No reason provided");
                console.log(`Socket closed with code: ${event.code}, reason: ${event.reason}`);
                clearInterval(pingIntervalId);
                if (!isUnmounted && attempt < maxReconnectAttempts) {
                    const delay = attempt === 0 ? 0 : Math.min(5000 * Math.pow(2, attempt - 1), 30000);
                    attempt++;
                    console.log(`Reconnecting WebSocket in ${delay / 1000}s... (attempt ${attempt})`);
                    reconnectTimeoutId = setTimeout(connectWebSocket, delay);
                } else if (!isUnmounted) {
                    setReconnecting(false);
                }
            };
        };

        function startPing() {
            if (pingIntervalId) clearInterval(pingIntervalId);
            pingIntervalId = setInterval(() => {
                if (websocket.current.readyState === WebSocket.OPEN) {
                    websocket.current.send(JSON.stringify({ action: "ping" }));
                }
            }, 30000);
        }

        connectWebSocket();
        return () => {
            isUnmounted = true;
            if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
                websocket.current.close();
            }
            if (pingIntervalId) clearInterval(pingIntervalId);
            if (reconnectTimeoutId) clearTimeout(reconnectTimeoutId);
        };
    }, [partyId]);

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

    return (
        <div className="avalon-party">
            {loading && isAvalon ? (
                <div className="avalon-loading-container">
                    <StoneEmberProgressBar duration={3.0} />
                    <div className="avalon-loading-message">Joining party…</div>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "center" }}>
                    <div style={{ flex: 1, maxWidth: "500px" }}>
                        {reconnecting && (
                            <div style={{ color: 'orange', margin: 8 }}>Reconnecting... (attempt {reconnectAttempts})</div>
                        )}
                        {/* Show only gameState.players before game starts; show poker circle after */}
                        {!gameState.gameStarted ? (
                            <div style={{textAlign:'center'}}>
                                <h2>Players:</h2>
                                <ul style={{
                                    fontSize: '1.85rem',
                                    fontFamily: 'Lancelot, Cinzel, serif',
                                    textTransform: 'none',
                                    color: 'var(--avalon-text-dark)',
                                    margin: 0,
                                    padding: 0
                                }}>
                                    {gameState.players.map((player, index) => (
                                        <li key={player.id} style={{
                                            marginBottom: 8,
                                            listStyle: 'none',
                                            color: 'var(--avalon-text-dark)',
                                            WebkitTextTransform: 'none',
                                            MozTextTransform: 'none',
                                            msTextTransform: 'none'
                                        }}>
                                            {/*<span style={{ fontFamily: 'Cormorant Garamond, Cinzel, serif', fontSize: '1.65rem' }} >{index + 1}. </span>*/}
                                            {player.name}
                                            {gameState.hostId === player.id ? ' (host)' : ''}
                                        </li>
                                    ))}
                                </ul>
                                {isAvalon && gameState.players.length < avalonMinPlayers && (
                                    <div style={{marginTop: '1.7rem'}}>
                                        <h3>Avalon game requires {avalonMinPlayers}-{avalonMaxPlayers} players. Waiting for more...</h3>
                                    </div>
                                )}
                                {!isHost && gameState.players.length >= avalonMinPlayers && (
                                    <div style={{marginTop: '1.7rem'}}>
                                        <h3>waiting for the host to start the game...</h3>
                                    </div>
                                )}
                                {isHost && gameState.players.length >= avalonMinPlayers &&(
                                    <div style={{display: 'flex', justifyContent: 'center', marginTop: '1.5rem'}}>
                                        <button className={isAvalon ? 'button' : ''} onClick={sendStartGame}>Start
                                            Game
                                        </button>
                                    </div>
                                )}
                                <h3>Code: {partyId}</h3>
                            </div>
                        ) : null}
                    </div>
                    <div className="poker-circle-container" style={{ flex: 1, display: gameState.gameStarted ? "flex" : "none", justifyContent: "center", alignItems: "center" }}>
                        <AvalonBoard players={gameState.players} hostId={gameState.hostId} />
                    </div>
                </div>
            )}
        </div>
    );
};

import AvalonBoard from './AvalonBoard.jsx';

export default GameParty; 