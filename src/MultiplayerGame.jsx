// Utility functions
const getLocalPlayerId = () => localStorage.getItem('player_id');

import { useRef, useState, useEffect } from "react";

// Main MultiplayerGame component
const MultiplayerGame = ({ partyId: propPartyId }) => {
    // --- State and Refs ---
    let partyId = propPartyId;
    if (!partyId) {
        const match = window.location.pathname.match(/party\/(\w+)/);
        if (match) partyId = match[1];
    }
    const websocket = useRef(null);
    const [gameState, setGameState] = useState({
        players: [],
        hostId: null,
        gameStarted: false,
    });
    const [reconnecting, setReconnecting] = useState(false);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    // Maximum number of WebSocket reconnection attempts before giving up
    const maxReconnectAttempts = 10;

    // --- Derived state ---
    const isHost = getLocalPlayerId() && gameState.hostId && getLocalPlayerId() === gameState.hostId;

    // --- Effects ---
    useEffect(() => {
        let isUnmounted = false;
        let pingIntervalId = null;
        let reconnectTimeoutId = null;

        const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
        const wsUrl = `${wsProtocol}://${window.location.host}/game/party/${encodeURIComponent(partyId)}`;

        // Connect WebSocket with reconnection logic
        const connectWebSocket = (attempt = 0) => {
            if (isUnmounted) return;
            setReconnecting(attempt > 0);
            setReconnectAttempts(attempt);
            websocket.current = new WebSocket(wsUrl);
            const ws = websocket.current;

            ws.onopen = () => {
                setReconnecting(false);
                setReconnectAttempts(0); // Reset attempts on successful connect
                attempt = 0
                console.log("WebSocket connected!");
                // Send player id and name on connect
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
                // Handle update_state
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
                    // First retry is immediate, subsequent retries use exponential backoff
                    const delay = attempt === 0 ? 0 : Math.min(5000 * Math.pow(2, attempt - 1), 30000);
                    console.log(`Reconnecting WebSocket in ${delay / 1000}s... (attempt ${attempt + 1})`);
                    reconnectTimeoutId = setTimeout(() => connectWebSocket(attempt + 1), delay);
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

    // --- Handlers ---
    const sendStartGame = () => {
        if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
            websocket.current.send(JSON.stringify({ action: "start_game" }));
        }
    };

    // --- Render ---
    return (
        <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "center" }}>
            <div style={{ flex: 1, maxWidth: "500px" }}>
                {reconnecting && (
                    <div style={{ color: 'orange', margin: 8 }}>Reconnecting... (attempt {reconnectAttempts})</div>
                )}
                {/* Show only gameState.players before game starts; show poker circle after */}
                {!gameState.gameStarted ? (
                    <div>
                        <h2>Players:</h2>
                        {gameState.players.length === 0 ? (
                            <p>No players connected yet.</p>
                        ) : (
                            <ul>
                                {gameState.players.map((player, index) => (
                                    <li key={player.id}>
                                        {player.name}
                                        {gameState.hostId === player.id && (
                                            <span style={{ color: 'green', marginLeft: 8 }} title="Host">●</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {isHost && (
                            <button onClick={sendStartGame} style={{ marginTop: 16 }}>Start Game</button>
                        )}
                    </div>
                ) : null}
            </div>
            <div className="poker-circle-container" style={{ flex: 1, display: gameState.gameStarted ? "flex" : "none", justifyContent: "center", alignItems: "center" }}>
                <PokerCircle players={gameState.players} hostId={gameState.hostId} />
            </div>
        </div>
    );
};

// --- PokerCircle component ---
const PokerCircle = ({ players, hostId }) => {
    const selfId = getLocalPlayerId();
    const numPlayers = players.length;
    // Rotate players so self is always at index 0
    let rotatedPlayers = players;
    const selfIndex = players.findIndex(p => p.id === selfId);
    if (selfIndex > 0) {
        rotatedPlayers = [
            ...players.slice(selfIndex),
            ...players.slice(0, selfIndex)
        ];
    }
    const circleSize = Math.min(window.innerWidth, window.innerHeight) * 0.625;
    const portraitWidth = circleSize / 7;
    const portraitHeight = portraitWidth * 1.5;
    const selfPortraitWidth = portraitWidth * 1.1;
    const selfPortraitHeight = portraitHeight * 1.1;
    const center = circleSize / 2;
    const radius = (center - Math.max(portraitWidth, portraitHeight) / 2) * 1.2;
    return (
        <div
            className="poker-circle"
            style={{
                position: "fixed",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: circleSize,
                height: circleSize,
                margin: 0,
                borderRadius: "50%",
                background: "none",
                boxShadow: "none",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 10,
            }}
        >
            {rotatedPlayers.map((player, i) => {
                const angle = ((i) * (2 * Math.PI) / numPlayers) + (Math.PI / 2);
                const isSelf = player.id === selfId;
                const isHost = player.id === hostId;
                const width = isSelf ? selfPortraitWidth : portraitWidth;
                const height = isSelf ? selfPortraitHeight : portraitHeight;
                const x = center + radius * Math.cos(angle) - width / 2;
                const y = center + radius * Math.sin(angle) - height / 2;
                return (
                    <div
                        key={player.id}
                        className={"poker-portrait" + (isSelf ? " self" : "")}
                        style={{
                            position: "absolute",
                            left: x,
                            top: y,
                            width: width,
                            height: height,
                            borderRadius: "50%",
                            background: isSelf ? "#4a90e2" : "#444",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: height * 0.0735,
                            border: isSelf ? "3px solid #fff" : "2px solid #888",
                            boxShadow: isSelf ? "0 0 10px #4a90e2" : "0 0 6px #222",
                            zIndex: isSelf ? 2 : 1,
                        }}
                    >
                        {player.name}
                        {isHost && (
                            <span style={{ color: 'green', marginLeft: 6, fontSize: 18 }} title="Host">●</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default MultiplayerGame;