import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function sortPlayers(players) {
  return [...players].sort((a, b) => {
    const aOrder = typeof a.order === 'number' ? a.order : 100;
    const bOrder = typeof b.order === 'number' ? b.order : 100;
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    return (a.name || a.id).localeCompare(b.name || b.id);
  });
}

export default function PlayerList({ players, selfId, hostId, isAvalon, onOrderChange }) {
  const isHost = selfId === hostId;
  // Defensive: assign order 100 if missing
  const safePlayers = players.map(p => ({ ...p, order: typeof p.order === 'number' ? p.order : 100 }));
  const sortedPlayers = sortPlayers(safePlayers);

  function handleDragEnd(result) {
    if (!result.destination) return;
    // Deep copy to avoid mutating props
    const reordered = sortedPlayers.map(p => ({ ...p }));
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    // Assign new order: 1,2,3... for all players in the new order
    let order = 1;
    for (let p of reordered) {
      p.order = order++;
    }
    onOrderChange(reordered);
  }

  return (
    <div className={isAvalon ? 'avalon-player-list' : 'player-list'} style={{ margin: '0 auto', padding: '8px 15px 8px 30px', width: '85%' }}>
      <DragDropContext onDragEnd={isHost ? handleDragEnd : undefined} {...(window.matchMedia('(pointer: coarse)').matches ? { delayTouchStart: 0 } : {})}>
        <Droppable droppableId="player-list-droppable" isDropDisabled={!isHost}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {sortedPlayers.map((player, idx) => {
                // Compose label for host/self
                let label = '';
                if (player.id === hostId && player.id === selfId) {
                  label = ' (host, you)';
                } else if (player.id === hostId) {
                  label = ' (host)';
                } else if (player.id === selfId) {
                  label = ' (you)';
                }
                return (
                  <Draggable key={player.id} draggableId={player.id} index={idx} isDragDisabled={!isHost}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={
                          (isAvalon ? 'avalon-player-item' : 'player-item') +
                          (player.id === selfId ? ' self' : '') +
                          (player.id === hostId ? ' host' : '')
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '10px',
                          color: isAvalon ? '#e0c97f' : '#232323',
                          fontFamily: isAvalon ? 'Lancelot, Cinzel, serif' : 'inherit',
                          padding: '0.8rem 0 0 0',
                          ...provided.draggableProps.style,
                        }}
                      >
                        {/* Number column */}
                        <div style={{ width: 32, textAlign: 'right', fontWeight: 700, fontSize: 'clamp(1.3rem, 2.4vw, 1.5rem)', color: '#bfa76f', fontFamily: 'Cinzel, serif', userSelect: 'none' }}>
                          {idx + 1}.
                        </div>
                        {/* Name and label */}
                        <div style={{ flex: 1, fontFamily: 'Lancelot, Cinzel, serif', fontSize: 'clamp(1.6rem, 4vw, 1.7rem)', letterSpacing: 1,  display: 'flex', alignItems: 'center', marginLeft: '0.5rem' }}>
                          {player.name || player.id}
                          {player.connected === false && (
                            <span style={{ marginLeft: 6, color: '#e57373', fontWeight: 700, fontSize: 'clamp(1.2rem, 1.7vw, 1.6rem)' }}>(disconnected)</span>
                          )}
                          <span style={{ marginLeft: 3, marginTop: 3, color: '#e0c97f', fontWeight: 700, fontSize: 'clamp(1.2rem, 1.7vw, 1.5rem)' }}>{label}</span>
                        </div>
                        {/* Drag handle/arrows for host */}
                        <div style={{ width: 22, textAlign: 'center', userSelect: 'none', opacity: isHost ? 1 : 0.2, fontSize: '1.2em', cursor: isHost ? 'grab' : 'default', color: isAvalon ? '#6C5F35FF' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                          {isHost ? (
                            <svg width="1em" height="1.4em" viewBox="0 0 8 24" style={{verticalAlign: 'middle', display: 'block', margin: '0 auto'}}>
                              <circle cx="4" cy="6" r="1.3" fill="currentColor"/>
                              <circle cx="4" cy="11.5" r="1.3" fill="currentColor"/>
                              <circle cx="4" cy="17" r="1.3" fill="currentColor"/>
                            </svg>
                          ) : <span>&nbsp;</span>}
                        </div>
                        
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
} 