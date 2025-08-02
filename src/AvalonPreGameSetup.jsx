import React from 'react';


// Special characters for Avalon
const AVALON_CHARACTERS = [
    { id: 'merlin',   name: 'Merlin',   background: '50% 50% / 120%', borderColor: '#317c9c' },
    { id: 'assassin', name: 'Assassin', background: '50% 35% / 120%', borderColor: '#712a10' },
    { id: 'percival', name: 'Percival', background: '55% 15% / 110%', borderColor: '#317c9c' },
    { id: 'morgana',  name: 'Morgana',  background: '40%  0% / 100%', borderColor: '#712a10' },
    { id: 'mordred',  name: 'Mordred',  background: '50% 50% / 100%', borderColor: '#712a10' },
    { id: 'oberon',   name: 'Oberon',   background: '50% 30% / 130%', borderColor: '#712a10' },
];

const AvalonPreGameSetup = ({ 
    isHost, 
    selectedCharacters, 
    setSelectedCharacters, 
    firstPlayerFlagActive, 
    setFirstPlayerFlagActive, 
    gameImages,
    isVertical
}) => {
    const handleCharacterToggle = (characterId) => {
        // First 2 characters (merlin, assassin) cannot be toggled
        if (characterId === 'merlin' || characterId === 'assassin') {
            return;
        }
        
        setSelectedCharacters(prev => {
            if (prev.includes(characterId)) {
                return prev.filter(id => id !== characterId);
            } else {
                return [...prev, characterId];
            }
        });
    };

    const handleFlagToggle = () => {
        setFirstPlayerFlagActive(prev => !prev);
    };

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            {/* Host Rules Section */}
            {isHost && (
                <div style={{ 
                    marginBottom: '1rem', 
                    maxWidth: '510px',
                    // padding: '1rem', 
                    // padding: '0.6rem 0.5rem 0.6rem 0.8rem', 
                    padding: `${isVertical ? '1.85% 1.4% 1.6% 3.8%' : '2.5% 3% 3% 4%'}`, //top, right, bottom, left
                    background: 'rgba(27,22,21,0.8)', 
                    borderRadius: '10px',
                    border: '1px solid #7c5a1a',
                    color: '#e0c97f',
                    fontSize: 'clamp(0.68rem, 1.8vw, 0.95rem)',
                    lineHeight: 1.4
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.4rem', color: '#bfa76f', textAlign: 'left', fontSize: 'clamp(0.72rem, 1.8vw, 1.0rem)', }}>
                        As a host, you may:
                    </div>
                    <div style={{ textAlign: 'left',                       textIndent: '-0.5rem' }}>• Select {isVertical ? 'more' : 'additional'} special characters (Merlin {isVertical ? '&' : 'and'} Assassin are always included)</div>
                    <div style={{ textAlign: 'left', marginTop: '0.28rem', textIndent: '-0.5rem' }}>• Sort players by seating and play order</div>
                    <div style={{ textAlign: 'left', marginTop: '0.28rem', textIndent: '-0.5rem' }}>• Uncheck the {isVertical ? '1st player flag' : 'flag next to Player 1'}  to randomly assign the first mission leader</div>
                </div>
            )}

            {/* Special Characters Grid */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                width: '100%',
                maxWidth: '510px',
                margin: '0 0 1.8rem 0',
                // margin: '0 auto 2rem auto',
                padding: '0',
                // padding: '0 1rem',
                boxSizing: 'border-box'
            }}>
                {AVALON_CHARACTERS.map((character, index) => {
                    const isSelected = selectedCharacters.includes(character.id);
                    const isLocked = character.id === 'merlin' || character.id === 'assassin';
                    const characterImage = gameImages[character.id]; //|| gameImages.oberon; // fallback to oberon
                    
                    return (
                        <div
                            key={character.id}
                            onClick={() => isHost && !isLocked && handleCharacterToggle(character.id)}
                            style={{
                                position: 'relative',
                                marginTop: '-0.2rem',
                                width: '14.5%',
                                aspectRatio: '1',
                                borderRadius: '50%',
                                border: `2px solid ${character.borderColor}`,
                                background: `url(${characterImage}) ${character.background} no-repeat`,
                                cursor: isHost && !isLocked ? 'pointer' : 'default',
                                opacity: isHost ? 1 : 0.88,
                                transition: 'all 0.2s ease',
                                ...(isHost && !isLocked && {
                                    ':hover': {
                                        borderColor: '#bfa76f',
                                        transform: 'scale(1.05)'
                                    }
                                })
                            }}
                        >
                            {/* Character name */}
                            <div style={{
                                position: 'absolute',
                                left: '50%',
                                bottom: '0',
                                transform: 'translateX(-50%) translateY(97%)',
                                fontSize: 'clamp(1.0rem, 1.5vw, 1.1rem)',
                                color: '#222',
                                background: 'rgba(224, 201, 127, 0.8)',
                                zIndex: -1,
                                lineHeight: 1.1,
                                padding: '0rem 0.3rem',
                                borderRadius: '10px',
                                fontFamily: 'Lancelot, Cinzel, serif',
                                textAlign: 'center',
                                whiteSpace: 'nowrap',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                            }}>
                                {character.name}
                            </div>
                            
                            {/* Selection indicator */}
                            {isSelected && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-5px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: 'clamp(16px, 3vw, 18px)',
                                    height: 'clamp(16px, 3vw, 18px)',
                                    background: '#4CAF50',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: 'clamp(10px, 2vw, 11px)',
                                    fontWeight: 'bold',
                                    border: '1px solid #fff',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}>
                                    ✓
                                </div>
                            )}
                            
                            {/* Locked indicator for first 2 characters */}
                            {isLocked && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-5px',
                                    right: '-5px',
                                    width: '16px',
                                    height: '16px',
                                    background: '#bfa76f',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                    color: '#1b1615'
                                }}>
                                    🔒
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AvalonPreGameSetup; 