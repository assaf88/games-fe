import  { useRef, useState, useEffect } from "react";

const MultiplayerGame = () => {
    const websocket = useRef(null); // Persistent WebSocket instance across renders
    const [gameState, setGameState] = useState({
        board: [],          // Represents the cardboard state
        players: [],        // List of connected players
        messages: [],       // Optional: Chat messages or logs
    });

    useEffect(() => {
        // Open the WebSocket connection
        const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
        const wsUrl = `${wsProtocol}://${window.location.host}/game`;
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
        <div>
            <h1>Multiplayer Game</h1>

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
    );
};

export default MultiplayerGame;