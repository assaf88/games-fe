import React, { useState, useEffect, useRef } from 'react';
import { QuestTeamToken, QuestVote, CrownIcon, DecisionSword } from './AvalonTokens';
import './styles/avalon/avalon.css';

const getLocalPlayerId = () => localStorage.getItem('player_id');

const AvalonBoard = ({ players, hostId, gameStarting, gameStarted, images, questLeader }) => {
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
                    const bgImage = (isSelf && player.specialId && images[player.specialId]) ? images[player.specialId] : images.unknown;
                    const isLeader = questLeader && player.id === questLeader;
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
                                        backgroundImage: `url(${bgImage})`,
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
                                    {(!isSelf || progress < 1) && (
                                      <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        borderRadius: '50%',
                                        background: 'radial-gradient(ellipse at center, rgba(60,60,60,0.9) 0%, rgba(20,20,20,0.95) 70%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 2,
                                      }}>
                                        <div style={{
                                          color: '#cfcfcf',
                                          fontFamily: 'Cinzel, serif',
                                          fontSize: Math.max(18, portraitWidth * 0.45),
                                          textShadow: '0 0 6px rgba(0,0,0,0.8)',
                                        }}>?</div>
                                      </div>
                                    )}
                                    {/* Crown + tokens: vertical orientation, positioned in front of portrait */}
                                    {progress >= 1 && (
                                      <div style={{
                                        position: 'absolute',
                                        left: '48%',
                                        // top: '-6%',
                                        top: `${isSelf ? '-6%' : '-7%'}`,
                                        transform: 'translate(-50%, -50%)',
                                        pointerEvents: 'none',
                                        zIndex: 3,
                                      }}>    
                                        <CrownIcon size={Math.max(16, portraitWidth * 0.38)} isLeader={isLeader} />
                                    </div>
                                    )}
                                </div>
                            </div>
                            {/* Names and in-game UI: only if progress >= 1 */}
                            {progress >= 1 && (
                                <div style={{
                                    position: 'absolute',
                                    left: nameX + width / 2,
                                    // top: nameY + height + (isSelf ? boxShadowHeight * 1.05 : 0) + (isVertical ? -0 : 4),
                                    top: nameY + height*0.85 + (isSelf ? boxShadowHeight * 1.05 : 0) + (isVertical ? -0 : 4),
                                    transform: 'translateX(-50%)',
                                    color: player.connected === false ? '#e57373' : (showSelfStyle ? 'var(--avalon-text-main)' : 'var(--avalon-text-dark)'),
                                    fontFamily: 'Lancelot, serif',
                                    fontSize: isVertical ? portraitWidth/3.2 : portraitWidth/4.1,
                                    textShadow: '0 0 4px #18181b',
                                    textAlign: 'center',
                                    whiteSpace: 'nowrap',
                                    pointerEvents: 'none',
                                    fontWeight: showSelfStyle ? 'bold' : 'normal',
                                    transition: 'opacity 5.2s',
                                    padding: '0px 4px',
                                    borderRadius: '6px',
                                    background: 'linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(40,40,40,0.9) 50%, rgba(20,20,20,0.95) 100%)',
                                    border: '2px solid rgba(61, 56, 0, 0.8)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(2px)',
                                    zIndex: 3,
                                    lineHeight: '1.05',
                                }}>
                                    {player.name}{isHost ? ' (h)' : ''}{player.connected === false ? ' (left)' : ''}
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
                
                {/* Tokens positioned independently in inner circle */}
                {progress >= 1 && rotatedPlayers.map((player, i) => {
                    const finalAngle = ((i) * (2 * Math.PI) / numPlayers) + (Math.PI / 2);
                    const tokenRadius = radius * (isVertical ? 0.64 : 0.70);
                    const tokenX = center + tokenRadius*1.15 * Math.cos(finalAngle) - (portraitWidth * 0.25) / 2 - (portraitWidth * 0.16);
                    const tokenY = center + tokenRadius * Math.sin(finalAngle) - (portraitWidth * 0.25) / 2 - (portraitHeight * (isVertical ? 0.05 : 0));
                    const isSelf = player.id === getLocalPlayerId();
                    
                    const isTeam = true;
                    const isVoting = true;
                    const hasVoted = true;
                    const isDeciding = false;
                    const hasDecided = false;
                    
                    return (
                        <div key={`tokens-${player.id}`} style={{
                            position: 'absolute',
                            left: tokenX,
                            top: tokenY,
                            display: 'flex',
                            gap: portraitWidth * 0.01,
                            transform: `rotate(${(finalAngle + Math.PI/2) * 180/Math.PI}deg)`,
                            pointerEvents: 'none',
                            zIndex: 4,
                            direction: 'rtl',
                            // scale: 1.02 ?? doesnt work?
                        }}>
                            {/* <div style={{ width: portraitWidth * 0.1 }} /> */}

                            {/* Team token */}
                            <div className='quest-team-token'
                                style={{  '--portrait-width': `${portraitWidth}px`,
                                    position: 'absolute',
                                    // left: `${isVertical ? '1.9vw' : '0.6vw'}`, //increasing will take it left
                                    // top: `${isVertical ? '4.8vw' : '1.6vw'}`,//increasing will take it to circle center
                                    left: `${isVertical ? '25%' : '25%'}`, //increasing will take it left
                                    top: `${isVertical ? '120%' : '120%'}`,//increasing will take it to circle center
                                    // display: 'none'
                                }}>
                                {/*{!isVertical2 + " sdgf"}*/}
                                <QuestTeamToken portraitWidth={isVertical ? portraitWidth*0.9 : portraitWidth} isVertical={isVertical} />
                            </div>
                            
                            {/* Purple token cards */}
                            <div id='vote1' className='quest-vote-card'
                                 style={{ 
                                    '--portrait-width': `${portraitWidth}px`,
                                    display: `${isDeciding? 'none' : 'inherit'}`, //not a bug!
                                    visibility: `${isVoting? 'visible' : 'hidden'}`,
                                 }}>
                                <QuestVote portraitWidth={portraitWidth} />
                            </div>
                            <div id='vote2' className='quest-vote-card'
                                 style={{ 
                                    '--portrait-width': `${portraitWidth}px`,
                                    display: `${isDeciding? 'none' : 'inherit'}`,
                                    visibility: `${isVoting && !hasVoted ? 'visible' : 'hidden'}`,
                                 }}>
                                <QuestVote portraitWidth={portraitWidth} />
                            </div>
                            <div id='vote3' className='quest-vote-card'
                                 style={{ 
                                    '--portrait-width': `${portraitWidth}px` ,
                                    position: 'absolute',
                                    // left: '0.9vw',
                                    left: `${isVertical ? '25%' : '25%'}`,
                                    zIndex: 5,
                                    display: `${isDeciding? 'none' : 'inherit'}`,
                                    visibility: `${isVoting && hasVoted ? 'visible' : 'hidden'}`,
                            }}>
                                <QuestVote portraitWidth={portraitWidth} />
                            </div>
                            
                            {/* Shield and sword cards */}
                            <div id='result1' className='quest-decision-card'
                                 style={{ 
                                    '--portrait-width': `${portraitWidth}px`,
                                    display: `${isDeciding? 'inherit' : 'none'}`, //not a bug!
                                    visibility: `${isDeciding? 'visible' : 'hidden'}`,
                                }}>
                                <DecisionSword size={200} angle={30} isShiny />
                            </div>
                            <div id='result2' className='quest-decision-card'
                                 style={{ 
                                    '--portrait-width': `${portraitWidth}px`,
                                    display: `${isDeciding? 'inherit' : 'none'}`,
                                    visibility: `${isDeciding && !hasDecided ? 'visible' : 'hidden'}`,
                                }}>
                                <DecisionSword size={200} angle={30} isShiny />
                            </div>
                            <div id='result3' className='quest-decision-card'
                                 style={{ 
                                    '--portrait-width': `${portraitWidth}px` ,
                                    position: 'absolute',
                                    // top: `${isVertical ? '26vw' : '800%'}`, //increasing will shrink
                                    top: `${isVertical ? '800%' : '800%'}`, //increasing will shrink
                                    // top: '270px',
                                    zIndex: 5,
                                    display: `${isDeciding? 'inherit' : 'none'}`,
                                    visibility: `${isDeciding && hasDecided ? 'visible' : 'hidden'}`,
                            }}>
                                <DecisionSword size={200} angle={30} isShiny />
                            </div>
                        </div>
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