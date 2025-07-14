import React from 'react';

const getLocalPlayerId = () => localStorage.getItem('player_id');

const AvalonBoard = ({ players, hostId }) => {
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
                            fontFamily: 'Cinzel, serif',
                            fontSize: height * 0.09,
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

export default AvalonBoard; 