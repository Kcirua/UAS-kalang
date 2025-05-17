import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Pastikan install react-router-dom
import IndexPage from './pages/IndexPage';
import LobbyPage from './pages/LobbyPage';
import MainPage from './pages/MainPage';
import GameOverPage from './pages/GameOverPage';
import './style.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/main" element={<MainPage />} /> 
        <Route path="/gameover" element={<GameOverPage />} />
      </Routes>
    </Router>
  );
}

export default App;