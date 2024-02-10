import React from 'react';
import { Routes, Route, } from 'react-router-dom';
import Settings from "./components/Settings/Settings";
import Game from "./components/Game/Game";
import './components/mobile/mobile.css';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Settings />} />
        <Route path="/game" element={<Game />} />
      </Routes>
  );
}

export default App;
