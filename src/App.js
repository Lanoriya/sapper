import React from 'react';
import { RecoilRoot } from 'recoil';
import { Routes, Route, } from 'react-router-dom';
import Settings from "./components/Settings/Settings";
import Game from "./components/Game/Game";
import './components/mobile/mobile.css';
import Leaderboard from './components/Leaderboard/Leaderboard';

function App() {
  return (
    <RecoilRoot>
      <Routes>
        <Route path="/" element={<Settings />} />
        <Route path="/game" element={<Game />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </RecoilRoot>
  );
}

export default App;
