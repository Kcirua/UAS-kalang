import React, { useRef, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Background from './components/Background';
import IndexPage from './pages/IndexPage';
import LobbyPage from './pages/LobbyPage';
import MainPage from './pages/MainPage';
import GameOverPage from './pages/GameOverPage';
import './style.css';
import bgMusicFile from './assets/audio/bg-music.mp3';
import StardewFade from './components/StardewFade';
import logo from './assets/your-logo.png';
import secondLogo from './assets/secondLogo.png';

const routeRefs = {
  '/':    React.createRef(),
  '/lobby': React.createRef(),
  '/main': React.createRef(),
  '/gameover': React.createRef(),
};

function AnimatedRoutes() {
  const location = useLocation();
  const nodeRef = routeRefs[location.pathname] || React.createRef();

  return (
    <TransitionGroup component={null}>
      <CSSTransition
        key={location.pathname}
        classNames="page-fade"
        timeout={500}
        nodeRef={nodeRef}
        unmountOnExit
      >
        <div ref={nodeRef}>
          <Routes location={location}>
            <Route path="/" element={<IndexPage />} />
            <Route path="/lobby" element={<LobbyPage />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/gameover" element={<GameOverPage />} />
          </Routes>
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
}

function App() {
  const audioRef = useRef(null);
  const [musicOn, setMusicOn] = useState(true);
  const [showOpening, setShowOpening] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowOpening(false), 14000); // Added extra time for final fade
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      if (musicOn) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [musicOn]);

  const toggleMusic = () => setMusicOn(prev => !prev);

  return (
    <Router>
      <div className="container-fluid p-0">
        <Background />
        {showOpening && (
          <StardewFade logoSrc={logo} secondLogoSrc={secondLogo} />
        )}
        {/* Audio toggle button (optional: place wherever you want) */}
        <button className="audio-toggle" onClick={toggleMusic}>
          {musicOn ? '🔊' : '🔇'}
        </button>
        <audio ref={audioRef} loop src={bgMusicFile} />
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;