import React from 'react';
import { useParams } from 'react-router-dom';
import MultiplayerGame from './MultiplayerGame.jsx';

const AvalonParty = () => {
    const { id } = useParams();

    return (
        <div>
            <h1>Welcome to party number {id}</h1>
            <MultiplayerGame partyId={id}/>
        </div>
    );
};

export default AvalonParty; 