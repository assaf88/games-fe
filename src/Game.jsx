import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Game = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const loggedInUser = sessionStorage.getItem('username');
        if (!loggedInUser) {
            navigate('/'); // Redirect to login if not logged in
        }
    }, [navigate]);

    return (
        <div>
            <h1>Hello, {sessionStorage.getItem('username')}</h1>
        </div>
    );
};

export default Game;
