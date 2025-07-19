import React, { useState, useEffect } from 'react';

import assassinImg from './styles/avalon/assassin.webp';
import cardbackImg from './styles/avalon/cardback.jpg';

import oberonImg from './styles/avalon/oberon20b.webp';


const getLocalPlayerId = () => localStorage.getItem('player_id');

const AvalonBoard = ({ players, hostId }) => {
    const selfId = getLocalPlayerId();
    const numPlayers = players.length;
    // Responsive circle size
    const getCircleSize = () => Math.min(window.innerWidth, window.innerHeight) * 0.525;
    // const getCircleSize = () => Math.min(window.innerWidth, window.innerHeight) * 0.625;
    const [circleSize, setCircleSize] = useState(getCircleSize());
    useEffect(() => {
        const handleResize = () => setCircleSize(getCircleSize());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    // Rotate players so self is always at index 0
    let rotatedPlayers = players;
    const selfIndex = players.findIndex(p => p.id === selfId);
    if (selfIndex > 0) {
        rotatedPlayers = [
            ...players.slice(selfIndex),
            ...players.slice(0, selfIndex)
        ];
    }
    const portraitWidth = circleSize / 7;
    const portraitHeight = portraitWidth * 1.5;
    const selfPortraitWidth = portraitWidth * 1.1;
    const selfPortraitHeight = portraitHeight * 1.1;
    const center = circleSize / 2;
    const radius = (center - Math.max(portraitWidth, portraitHeight) / 2) * 1.1;
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
                    <div key={player.id} style={{
                        position: "absolute",
                        left: x,
                        top: y,
                        width: width,
                        height: height,
                        display: "block"
                    }}>
                        <div
                            className={"poker-portrait" + (isSelf ? " self" : "")}
                            style={{
                                width: width,
                                height: height,
                                borderRadius: "50%",
                                backgroundImage: `url(${oberonImg})`,
                                // backgroundImage: `url(${cardbackImg})`,
                                // backgroundImage: `url(${assassinImg})`, // dont remove
                                backgroundSize: '155%', //oberon
                                // backgroundSize: '108%', //cardbackImg
                                // backgroundSize: '147%',//assassin final - dont remove
                                backgroundPosition: '50% 0%', //oberon
                                // backgroundPosition: '55% 50%', //cardbackImg
                                // backgroundPosition: '40% 35%',//assassin final - dont remove
                                backgroundRepeat: "no-repeat",
                                color: "#fff",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                color2: "#ddbb53",//do not delete - for easier choosing colors for other atts
                                boxShadow: isSelf ? "0 0 12px #DDBB53FF" : "0 0 15px #111",
                                // boxShadow: isSelf ? "0 0 5px #4a90e2" : "0 0 32px #1f1", //selecting player - do not remove
                                zIndex: isSelf ? 2 : 1,
                                position: 'relative',
                            }}
                        >
                        </div>
                        <div style={{
                            position: 'absolute',
                            left: '50%',
                            top: height + (isSelf ? Math.max(15, height * 0.08) : 7),
                            transform: 'translateX(-50%)',
                            color: 'var(--avalon-text-dark)',
                            fontFamily: 'Lancelot, serif',
                            fontSize: portraitWidth/3.3,
                            textShadow: '0 0 4px #18181b',
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                        }}>{player.name}{isHost ? ' (host)' : ''}</div>
                    </div>

                );
            })}
        </div>
    );
};

function getPortraitStyle(role, isSelf) { //for later do not remove
    let backgroundPosition = "40% 55%";
    let backgroundSize = "130%";

    if (isSelf) {
        backgroundPosition = "45% 60%";
        backgroundSize = "140%";
    }

    if (role === 'assassin') {
        backgroundPosition = "42% 58%";
    } else if (role === 'merlin') {
        backgroundPosition = "38% 52%";
    }

    return {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize,
        backgroundPosition,
        backgroundRepeat: "no-repeat",
        border: isSelf ? "2px solid #aaa" : "3px solid #777",
        boxShadow: isSelf ? "0 0 10px #4a90e2" : "0 0 6px #222",
        zIndex: isSelf ? 2 : 1,
    };
}



export default AvalonBoard; 