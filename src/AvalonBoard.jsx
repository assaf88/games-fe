import React, { useState, useEffect, useRef } from 'react';

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

    // Rotonda animation state
    const [progress, setProgress] = useState(0); // 0 to 1
    const animRef = useRef();
    useEffect(() => {
        let start = null;
        const duration = 7000; // 10 seconds
        function easeOut(t) {
            return 1 - Math.pow(1 - t, 2); // quadratic ease-out
        }
        function animate(ts) {
            if (!start) start = ts;
            let t = (ts - start) / duration;
            if (t > 1) t = 1;
            setProgress(easeOut(t));
            if (t < 1) {
                animRef.current = requestAnimationFrame(animate);
            }
        }
        setProgress(0);
        animRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animRef.current);
    }, [players.length]);

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
                const finalAngle = ((i) * (2 * Math.PI) / numPlayers) + (Math.PI / 2);
                // Animate from +360deg offset (one full circle ahead)
                const angle = finalAngle + (1 - progress) * 2 * Math.PI;
                const isSelf = player.id === selfId;
                const isHost = player.id === hostId;
                const showSelfStyle = isSelf && progress >= 1;
                const width = showSelfStyle ? selfPortraitWidth : portraitWidth;
                const height = showSelfStyle ? selfPortraitHeight : portraitHeight;
                const x = center + radius * Math.cos(angle) - width / 2;
                const y = center + radius * Math.sin(angle) - height / 2;
                // Final name position (after animation)
                const nameX = center + radius * Math.cos(finalAngle) - width / 2;
                const nameY = center + radius * Math.sin(finalAngle) - height / 2;
                return (
                    <React.Fragment key={player.id}>
                        <div style={{
                            position: "absolute",
                            left: x,
                            top: y,
                            width: width,
                            height: height,
                            display: "block"
                        }}>
                            <div
                                className={"poker-portrait" + (showSelfStyle ? " self" : "")}
                                style={{
                                    width: width,
                                    height: height,
                                    borderRadius: "50%",
                                    backgroundImage: `url(${cardbackImg})`,
                                    backgroundSize: '108%',
                                    backgroundPosition: '55% 50%',
                                    backgroundRepeat: "no-repeat",
                                    color: "#fff",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "bold",
                                    color2: "#ddbb53",
                                    boxShadow: showSelfStyle ? "0 0 12px #DDBB53FF" : "0 0 15px #111",
                                    zIndex: showSelfStyle ? 2 : 1,
                                    position: 'relative',
                                    transition: 'box-shadow 0.3s',
                                }}
                            >
                            </div>
                        </div>
                        {progress >= 1 && (
                            <div style={{
                                position: 'absolute',
                                left: nameX + width / 2,
                                top: nameY + height + (isSelf ? Math.max(15, height * 0.08) : 7),
                                transform: 'translateX(-50%)',
                                color: showSelfStyle ? 'var(--avalon-text-main)' : 'var(--avalon-text-dark)',
                                fontFamily: 'Lancelot, serif',
                                fontSize: portraitWidth/3.3,
                                textShadow: '0 0 4px #18181b',
                                textAlign: 'center',
                                whiteSpace: 'nowrap',
                                pointerEvents: 'none',
                                fontWeight: showSelfStyle ? 'bold' : 'normal',
                                opacity: 1,
                                transition: 'opacity 0.3s',
                            }}>
                                {player.name}{isHost ? ' (host)' : ''}
                            </div>
                        )}
                    </React.Fragment>
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