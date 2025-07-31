import {BrowserRouter as Router, Link, Route, Routes, useLocation} from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import './styles/GamesList.css';
import { backgroundImages } from './assets';

const faviconMap = {
    avalon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='30' fill='%23333' stroke='%23ddbb53' stroke-width='4'/%3E%3Cpath d='M44 50 Q38 38 54 24 Q44 28 42 18 Q40 10 50 12 Q46 12 42 16 Q38 20 38 28 Q38 38 26 44 Q32 52 44 50 Z' fill='%23ddbb53' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E",
    default: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='30' fill='%23333' stroke='%23ddbb53' stroke-width='4'/%3E%3Cpath d='M44 50 Q38 38 54 24 Q44 28 42 18 Q40 10 50 12 Q46 12 42 16 Q38 20 38 28 Q38 38 26 44 Q32 52 44 50 Z' fill='%23ddbb53' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E"
};

const GameBackground = () => {
  const location = useLocation();
  let gameName = location.pathname.split('/')[1];
  return <div className={gameName ? gameName+'-bg' : ''} />;
};

const useDynamicTitleAndFavicon = () => {
    const location = useLocation();
    useEffect(() => {
        const gameName = location.pathname.split('/')[1];
        let title = 'Web Games';
        let favicon = faviconMap.default;
        if (gameName) {
            title = gameName.charAt(0).toUpperCase() + gameName.slice(1);
            if (faviconMap[gameName]) {
                favicon = faviconMap[gameName];
            }
        }
        document.title = title;
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = favicon;
    }, [location]);
};

const DynamicTitleAndFavicon = () => {
    useDynamicTitleAndFavicon();
    return null;
};

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

const GameLobby = lazy(() => import('./GameLobby.jsx'));
const GameParty = lazy(() => import('./GameParty.jsx'));

const GamesList = () => {
  // Staged preloading logic (must be inside component)
  useEffect(() => {
    let isMounted = true;
    import('./GameLobby.jsx').then(() => {
      if (isMounted) {
        //importing components for warmup
        import('./GameParty.jsx');
        import('./AvalonBoard.jsx');

        backgroundImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
      }
    });
    return () => { isMounted = false; };
  }, []);
    return (
        <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
            <GameBackground />
            <DynamicTitleAndFavicon />
            <Routes>
                <Route exact path="/" element={<GamesListPage />} />
                <Route path="/avalon" element={
                  <Suspense fallback={<div></div>}>
                    <GameLobby />
                  </Suspense>
                } />
                <Route path="/avalon/party/:id" element={
                  <Suspense fallback={<div></div>}>
                    <GameParty />
                  </Suspense>
                } />
            </Routes>
        </Router>
    );
};

export default GamesList;
