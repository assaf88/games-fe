// import React from 'react';
// import {  Navigate, BrowserRouter } from 'react-router-dom';
// import {  Switch } from 'react-router-dom';
// import UsernameForm from './components/UsernameForm'; // Import the form component
// import Party from './components/party'; // Assuming Party.js is where the game logic will be
// import AvalonPage from './garbage/avalon.jsx'; // Import your AvalonPage component
// import PartyPage from './garbage/Party.jsx';
// import * as StompJs from "@stomp/stompjs"; // Import your AvalonPage component+
// import { Client } from "@stomp/stompjs";
// import SockJS from "sockjs-client";
// import { Stomp } from "@stomp/stompjs";
// import WebSocketComponent from "./components/WebSocketComponent.jsx";
// import GameClient from "./garbage/GameClient.jsx";
// import GameClient2 from "./garbage/GameClient2.jsx";
import MultiplayerGame from "./MultiplayerGame.jsx";
// import {Component} from "react";
// import {Route, Router, Routes} from "react-router-dom";
// import Home from "./Home.jsx"
// import Party from "./Party.jsx"
// import NotFound from "./NotFound";



function App() {
    // console.log(StompJs.Versions);
    // alert(StompJs.Versions);

    //removes global not found error/warning
    window.global ||= window;


    return (
        // <Router>
        //     <Routes>
        //         <Route path="/" element={<Navigate to="/avalon"/>}/> {/* Redirect root to /avalon */}
        //         <Route path="/avalon" element={<AvalonPage/>}/> {/* Avalon page */}
        //         <Route path="/avalon/party/:id" element={<PartyPage/>}/> {/* Dynamic party route */}
        //
        //     </Routes>
        // </Router>

        <div className="App">
            <h1>React WebSocket with Spring Boot</h1>
            {/*<GameClient2/>*/}
            <MultiplayerGame/>
        </div>

        // <Router basename="/avalon">
        //     <Routes>
        //         <Route path="/" element={<Home />} /> {/* Loads for /avalon */}
        //         <Route path="/party/:id" element={<Party />} /> {/* Loads for /avalon/party/:id */}
        //
        //         {/* Fallback for unmatched routes */}
        //         <Route path="*" element={<NotFound />} />
        //     </Routes>
        // </Router>
    );
}
export default App;
