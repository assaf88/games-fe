import React, { useState, useEffect, useRef } from 'react';
import './styles/avalon/avalon.css';

const getLocalPlayerId = () => localStorage.getItem('player_id');

const AvalonBoard = ({ players, hostId, gameStarting, gameStarted, images }) => {
    //loading images before rendering - NOT CRITICAL NOW, BUT DO NOT REMOVE
    // useEffect(() => {
    //     const img = new Image();
    //     img.src = '/styles/images/avalon/oberon20b.webp';
    //     img.onload = () => setLoaded(true);
    // }, []);

    const selfId = getLocalPlayerId();
    const numPlayers = players.length;
    const isVertical = window.innerHeight > window.innerWidth;

    const getCircleSize = () => {
        return Math.min(window.innerHeight * 0.58, window.innerWidth * 0.90);
      };

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
    const portraitWidth = circleSize / (isVertical ? 7: 8.2);
    const portraitHeight = portraitWidth * 1.31;
    const center = circleSize / 2;
    const radius = (center - Math.max(portraitWidth, portraitHeight) / 2) * (isVertical ? 1.1 : 1.2);

    // Animation and in-game UI logic
    const [progress, setProgress] = useState(0); // 0 to 1
    const animRef = useRef();
    useEffect(() => {
        // console.log('AvalonBoard effect:', { gameStarting, gameStarted });
        if (gameStarting) {
            let start = null;
            const duration = 5000;
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
        } else if (gameStarted) {
            setProgress(1);
        } else {
            setProgress(0);
        }
    }, [gameStarting, gameStarted]);

    // console.log('AvalonBoard render:', { gameStarted, progress });

    return (
        <div className="avalon-circle-container" style={{ flex: 1, display: gameStarted ? "flex" : "none", justifyContent: "center", alignItems: "center" }}>
            <div
                className="avalon-circle"
                style={{
                    width: circleSize,
                    height: circleSize,
                }}
            >
                {gameStarted && rotatedPlayers.map((player, i) => {
                    const finalAngle = ((i) * (2 * Math.PI) / numPlayers) + (Math.PI / 2);
                    // Animate from +360deg offset (one full circle ahead)
                    const angle = finalAngle - (1 - progress) * 2 * Math.PI;
                    const isSelf = player.id === selfId;
                    const isHost = player.id === hostId;
                    const showSelfStyle = isSelf && progress >= 1;
                    const width = portraitWidth;
                    const height = portraitHeight;
                    const x = center + radius * Math.cos(angle) - width / 2;
                    const y = center + radius * Math.sin(angle) - height / 2;
                    // Final name position (after animation)
                    const nameX = center + radius * Math.cos(finalAngle) - width / 2;
                    const nameY = center + radius * Math.sin(finalAngle) - height / 2;
                    const boxShadowWidth = portraitWidth * 0.1;
                    const boxShadowHeight = portraitHeight * 0.1;
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
                                    className={"avalon-portrait" + (showSelfStyle ? " self" : "")}
                                    style={{
                                        width: width,
                                        height: height,
                                        backgroundImage: `url(${images.oberon})`,
                                        // backgroundImage: `url(/styles/images/avalon/oberon20b.webp)`,
                                        backgroundSize: '140%',
                                        backgroundPosition: '50% 10%',
                                        boxShadow: showSelfStyle
                                            ? `0 0 ${boxShadowHeight}px ${boxShadowWidth}px #DDBB53FF`
                                            : "0 0 15px #111",
                                    }}
                                >
                                    <div
                                        className="avalon-portrait-frame"
                                    />
                                </div>
                            </div>
                            {/* Names and in-game UI: only if progress >= 1 */}
                            {progress >= 1 && (
                                <div style={{
                                    position: 'absolute',
                                    left: nameX + width / 2,
                                    top: nameY + height + (isSelf ? boxShadowHeight * 1.05 : 0) + (isVertical ? -0 : 4),
                                    transform: 'translateX(-50%)',
                                    color: player.connected === false ? '#e57373' : (showSelfStyle ? 'var(--avalon-text-main)' : 'var(--avalon-text-dark)'),
                                    fontFamily: 'Lancelot, serif',
                                    fontSize: isVertical ? portraitWidth/3 : portraitWidth/3.8,
                                    textShadow: '0 0 4px #18181b',
                                    textAlign: 'center',
                                    whiteSpace: 'nowrap',
                                    pointerEvents: 'none',
                                    fontWeight: showSelfStyle ? 'bold' : 'normal',
                                    transition: 'opacity 5.2s',
                                }}>
                                    {player.name}{isHost ? ' (h)' : ''}{player.connected === false ? ' (left)' : ''}
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
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