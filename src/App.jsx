// import React from 'react';
import {BrowserRouter as Router, Link, Route, Routes, useNavigate, useParams} from 'react-router-dom';

const App = () => {
    return (
        <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
            <Routes>
                <Route exact path="/" element={<GameListPage />} />
                <Route path="/avalon" element={<AvalonHomePage />} />
                <Route path="/avalon/party/:id" element={<AvalonPartyPage />} />

                <Route component={NotFound} />
            </Routes>
        </Router>
    );
};

const NotFound = () => {
    return (
        <div>
            <h1>Page Not Found</h1>
            <p>Sorry, the page you are looking for does not exist.</p>
        </div>
    );
};

// 1. Game List Page
const GameListPage = () => {
    return (
        <div>
            <h1>Games List</h1>
            <Link to="/avalon">
                <button>Avalon</button>
            </Link>
            <Link to="/avalon2">
                <button>Avalon2</button>
            </Link>
        </div>
    );
};

// 2. Avalon Home Page - Create Party Button
const AvalonHomePage = () => {
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

// 3. Party Page - Display Party ID
const AvalonPartyPage = () => {
    const { id } = useParams();

    return (
        <div>
            <h1>Welcome to party number {id}</h1>
        </div>
    );
};

export default App;
