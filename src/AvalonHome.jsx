import React from 'react';
import { useNavigate } from 'react-router-dom';

const AvalonHome = () => {
    const navigate = useNavigate();

    const createParty = () => {
        // Generate a random party ID
        const partyId = Math.floor(Math.random() * 10000);
        navigate(`/avalon/party/${partyId}`);
    };

    return (
        <div>
            <h1>Avalon Game</h1>
            <button onClick={createParty}>Create Party</button>
        </div>
    );
};

export default AvalonHome; 