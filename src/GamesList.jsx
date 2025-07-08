import {BrowserRouter as Router, Link, Route, Routes} from 'react-router-dom';
import AvalonHome from './AvalonHome.jsx';
import AvalonParty from './AvalonParty.jsx';
import './styles/GamesList.css';

const GamesListPage = () => {
    return (
        <div className="game-list-rpg-bg">
            {/* <div className="game-list-rpg-container"> */}
                <Link to="/avalon" className="game-list-rpg-link">
                    <button className="game-list-rpg-btn">Avalon</button>
                </Link>
                {/* <Link to="/avalon2" className="game-list-rpg-link">
                    <button className="game-list-rpg-btn">TBA..</button>
                </Link> */}
            {/* </div> */}
        </div>
    );
};

const GamesList = () => {
    return (
        <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
            <Routes>
                <Route exact path="/" element={<GamesListPage />} />
                <Route path="/avalon" element={<AvalonHome />} />
                <Route path="/avalon/party/:id" element={<AvalonParty />} />
            </Routes>
        </Router>
    );
};

export default GamesList;
