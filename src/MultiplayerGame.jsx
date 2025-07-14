import  { useRef, useState, useEffect } from "react";

const getLocalPlayerId = () => localStorage.getItem('player_id');

const MultiplayerGame = ({ partyId: propPartyId }) => {
    let partyId = propPartyId;
    if (!partyId) {
        const match = window.location.pathname.match(/party\/(\w+)/);
        if (match) partyId = match[1];
    }
    const websocket = useRef(null); // Persistent WebSocket instance across renders
    const [gameState, setGameState] = useState({
        board: [],          // Represents the cardboard state
        players: [],        // List of connected players
        messages: [],       // Optional: Chat messages or logs
        hostId: null,       // Host player id
    });
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        if (!partyId) {
            console.error("No partyId provided to MultiplayerGame!");
            return;
        }
        // Open the WebSocket connection
        const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
        const wsUrl = `${wsProtocol}://${window.location.host}/game/party/${encodeURIComponent(partyId)}`;
        let reconnectTimeout; 
        let isUnmounted = false; // To prevent retries after unmounting
        const pingInterval = 30000;
        let pingIntervalId = null;

        //method
        const connectWebSocket = () => {
            console.log("Connecting to WebSocket:", wsUrl);
            websocket.current = new WebSocket(wsUrl);
            const ws = websocket.current;

            websocket.current.onopen = () => {
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

                // Update game state based on WebSocket message
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
                } else if (messageData.action === "update_board") {
                    setGameState(prev => ({
                        ...prev,
                        board: messageData.board,
                    }));
                } else if (messageData.action === "join_game") {
                    setGameState((prev) => ({
                        ...prev,
                        players: [...prev.players, messageData.username],
                    }));
                } else if (messageData.action === "leave_game") {
                    setGameState((prev) => ({
                        ...prev,
                        players: prev.players.filter(player => player !== messageData.username),
                    }));
                } else if (messageData.action === "play_card") {
                    setGameState((prev) => ({
                        ...prev,
                        messages: [...prev.messages, messageData.card],
                    }));
                }
            };

            ws.onerror = (err) => {
                console.error("WebSocket error:", err);
            };

            ws.onclose = (event) => {
                console.log("WebSocket closed:", event.reason || "No reason provided");
                console.log(`Socket closed with code: ${event.code}, reason: ${event.reason}`);
                clearInterval(pingIntervalId);
                // Remove reconnecting logic
            };
        };

        //keeps the connection alive, instead of opening a new one everytime it becomes inactive
        function startPing() {
            if (pingIntervalId) {
                // Clear any existing interval to avoid multiple intervals
                clearInterval(pingIntervalId);
            }

            pingIntervalId = setInterval(() => {
                if (websocket.current.readyState === WebSocket.OPEN) {
                    websocket.current.send(JSON.stringify({ action: "ping" }));
                }
            }, pingInterval);
        }

        connectWebSocket();

        // Cleanup function when the component unmounts
        return () => {
            isUnmounted = true;
            console.log("Cleaning up WebSocket...");
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
                websocket.current.close();
            }
        };
    }, []); // Run the effect only once when the component mounts

    const sendStartGame = () => {
        if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
            websocket.current.send(JSON.stringify({ action: "start_game" }));
            setGameStarted(true);
        }
    };

    const isHost = getLocalPlayerId() && gameState.hostId && getLocalPlayerId() === gameState.hostId;

    return (
        <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "center" }}>
            <div style={{ flex: 1, maxWidth: "500px" }}>
                {/* Remove Players, Game Board, Broadcast Messages as per requirements */}
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

// PokerCircle component for circular player arrangement
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
    const circleSize = Math.min(window.innerWidth, window.innerHeight) * 0.625; // 62.5vw or vh
    const portraitWidth = circleSize / 7; // 
    const portraitHeight = portraitWidth * 1.5
    const selfPortraitWidth = portraitWidth * 1.1;
    const selfPortraitHeight = portraitHeight * 1.1;
    const center = circleSize / 2;
    // Increase radius by 20% for more space between portraits
    const radius = (center - Math.max(portraitWidth, portraitHeight) / 2) * 1.2;
    // Place self at hour 6 (bottom, 90deg, π/2)
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
                // Self at hour 6 (90deg, π/2), others spaced evenly
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
                            fontSize: height * 0.0735, // 30% smaller than before (0.105 * 0.7)
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