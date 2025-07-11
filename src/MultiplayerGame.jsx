import  { useRef, useState, useEffect } from "react";

const MultiplayerGame = ({ partyId: propPartyId }) => {
    // Fallback: try to extract partyId from URL if not provided
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
    });

    useEffect(() => {
        if (!partyId) {
            console.error("No partyId provided to MultiplayerGame!");
            return;
        }
        // Open the WebSocket connection
        const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
        const wsUrl = `${wsProtocol}://${window.location.host}/game/party/${encodeURIComponent(partyId)}`;
        let reconnectTimeout; // Timeout for reconnect
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
                // we don't need to see this now, the BE broadcasts this
                // websocket.current.send(JSON.stringify({ action: "join_game", username: "Player1" }));
                 startPing(); //todo: later in backend - if ping - just return game state
            };

            ws.onmessage = (event) => {
                let rawData = event.data;
                let messageData;
                try {
                    console.log("WebSocket message received:", rawData);
                    // If the server doesn't prefix messages with strings like "Broadcast:",
                    messageData = JSON.parse(rawData);
                } catch (err) {
                    console.error("Failed to parse WebSocket message:", rawData, err);
                }

                // Update game state based on WebSocket message
                if (messageData.action === "update_board") {
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
                //this not suppose to happen without ping or without user is afk
                console.log("WebSocket closed:", event.reason || "No reason provided");
                console.log(`Socket closed with code: ${event.code}, reason: ${event.reason}`);
                clearInterval(pingIntervalId);
                if (!isUnmounted) {
                    console.log("Reconnecting WebSocket connection in 2 seconds...");
                    reconnectTimeout = setTimeout(connectWebSocket, 2000);
                }
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


    const sendMessage = () => {
        // console.log("try to play spades.....");
        if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
            websocket.current.send(
                JSON.stringify({ action: "play_card", card: "Ace of Spades" })
            );
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "center" }}>
            <div style={{ flex: 1, maxWidth: "500px" }}>
                {/* Removed <h1>Multiplayer Game</h1> */}
                {/* Display connected players */}
                <h2>Players:</h2>
                {gameState.players.length === 0 ? (
                    <p>No players connected yet.</p>
                ) : (
                    <ul>
                        {gameState.players.map((player, index) => (
                            <li key={index}>{player}</li>
                        ))}
                    </ul>
                )}
                {/* Display the game board */}
                <h2>Game Board:</h2>
                {gameState.board.length === 0 ? (
                    <p>The board is currently empty!</p>
                ) : (
                    <div style={{display: "flex", flexWrap: "wrap"}}>
                        {gameState.board.map((card, index) => (
                            <div
                                key={index}
                                style={{
                                    border: "1px solid black",
                                    margin: "5px",
                                    padding: "10px",
                                    borderRadius: "5px",
                                }}
                            >
                                {card}
                            </div>
                        ))}
                    </div>
                )}
                {/* Display chat/broadcast messages */}
                <h2>Broadcast Messages:</h2>
                {gameState.messages.length === 0 ? (
                    <p>No messages yet.</p>
                ) : (
                    <div>
                        {gameState.messages.map((message, index) => (
                            <p key={index}>{message}</p>
                        ))}
                    </div>
                )}
                <button onClick={sendMessage}>Play Card</button>
            </div>
            <div className="poker-circle-container" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <PokerCircle players={gameState.players} />
            </div>
        </div>
    );
};

// PokerCircle component for circular player arrangement
const PokerCircle = ({ players }) => {
    // For demo, pick the first player as self if no session/connection id
    const selfIndex = 0;
    const numPlayers = players.length;
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
            {players.map((player, i) => {
                // Self at hour 6 (90deg, π/2), others spaced evenly
                const angle = ((i - selfIndex) * (2 * Math.PI) / numPlayers) + (Math.PI / 2);
                const isSelf = i === selfIndex;
                const width = isSelf ? selfPortraitWidth : portraitWidth;
                const height = isSelf ? selfPortraitHeight : portraitHeight;
                const x = center + radius * Math.cos(angle) - width / 2;
                const y = center + radius * Math.sin(angle) - height / 2;
                return (
                    <div
                        key={player}
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
                        {player}
                    </div>
                );
            })}
        </div>
    );
};

export default MultiplayerGame;