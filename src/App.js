// src/App.js
import React, { useRef, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Background from './components/Background';
import IndexPage from './pages/IndexPage';
import LobbyPage from './pages/LobbyPage';
import MainPage from './pages/MainPage';
import GameOverPage from './pages/GameOverPage';
import Minigame1Page from './pages/Minigame1Page';
import Minigame2Page from './pages/Minigame2Page';
import Minigame3Page from './pages/Minigame3Page';
import CreditsPage from './pages/CreditsPage';
import './style.css';
import bgMusicFile from './assets/audio/bg-music.mp3';
import StardewFade from './components/StardewFade';
import logo from './assets/logoStudio.png';
import secondLogo from './assets/secondLogo.png';
import Cloud from './components/Cloud';
import Star from './components/Star';
import cloud1 from './assets/cloud 1.png';
import cloud2 from './assets/cloud 2.png';
import cloud3 from './assets/cloud 3.png';
import cloud4 from './assets/cloud 4.png';
import cloud5 from './assets/cloud 5.png';
import cloud6 from './assets/cloud 6.png';

const cloudImages = [cloud1, cloud2, cloud3, cloud4, cloud5, cloud6];
const routeRefs = {
  '/': React.createRef(),
  '/lobby': React.createRef(),
  '/main': React.createRef(),
  '/gameover': React.createRef(),
  '/minigame1': React.createRef(),
  '/minigame2': React.createRef(),
  '/minigame3': React.createRef(),
  '/credits': React.createRef(),
};
function AnimatedRoutes() {
  const location = useLocation();
  const nodeRef = routeRefs[location.pathname] || React.createRef(); 
  return (
    <TransitionGroup component={null}>
      <CSSTransition
        key={location.pathname}
        classNames="page-fade"
        timeout={800}
        nodeRef={nodeRef}
        unmountOnExit
      >
        <div ref={nodeRef} className="page-container">
          <Routes location={location}>
            <Route path="/" element={<IndexPage />} />
            <Route path="/lobby" element={<LobbyPage />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/gameover" element={<GameOverPage />} />
            <Route path="/minigame1" element={<Minigame1Page />} />
            <Route path="/minigame2" element={<Minigame2Page />} />
            <Route path="/minigame3" element={<Minigame3Page />} />
            <Route path="/credits" element={<CreditsPage />} /> {/* <- 3. Tambahkan rute baru */}
          </Routes>
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
}

function App() {
  const [showOverlay, setShowOverlay] = useState(true); 
  const [showMusicPrompt, setShowMusicPrompt] = useState(false); 
  const [showOpening, setShowOpening] = useState(false); 
  const [audioEnabled, setAudioEnabled] = useState(false); 
  const [volume, setVolume] = useState(0.5); 
  const audioRef = useRef(null); 
  const starsContainerRef = useRef(null); 
  const clouds = Array.from({ length: 10 }, (_, i) => {
    const img = cloudImages[Math.floor(Math.random() * cloudImages.length)];
    return <Cloud key={i} src={img} alt={`Cloud ${i + 1}`} />;
  }); 
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOverlay(false); 
      setShowMusicPrompt(true); 
    }, 2000);

    return () => clearTimeout(timer);
  }, []); 
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume; 
    }
  }, [volume]); 
  const handleMusicChoice = (choice) => {
    setShowMusicPrompt(false); 
    if (choice && audioRef.current) {
      setAudioEnabled(true); 
      audioRef.current.volume = volume; 
      audioRef.current.play(); 
    }
    setShowOpening(true); 
    const timer = setTimeout(() => {
      setShowOpening(false); 
    }, 14000);
    return () => clearTimeout(timer); 
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (audioEnabled) {
        audioRef.current.pause(); 
      } else {
        audioRef.current.play(); 
      }
      setAudioEnabled(!audioEnabled); 
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value); 
    setVolume(newVolume); 
  };
  return (
    <Router>
      <div className="app-container">
        <div className="persistent-background">
          <div id="stars" ref={starsContainerRef}>
            {Array.from({ length: 50 }, (_, i) => <Star key={i} />)}
          </div>
          <div className="lobby-cloud-container">
            {clouds}
          </div>
        </div>

        <div className="main-content">
          <AnimatedRoutes />
        </div>

        {!showMusicPrompt && !showOpening && (
          <div className="audio-controls">
            <button
              className="audio-toggle"
              onClick={toggleAudio}
              aria-label={audioEnabled ? 'Mute' : 'Unmute'}
            >
              {audioEnabled ? '🔊' : '🔇'}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
              aria-label="Volume"
            />
          </div>
        )}
        <audio ref={audioRef} src={bgMusicFile} loop />

        {showOverlay && <StardewFade />}
        {showMusicPrompt && (
          <div className="music-prompt-overlay">
            <div className="music-prompt-box">
              <h2>Enable Music?</h2>
              <div className="music-prompt-buttons">
                <button
                  className="music-choice-btn yes-btn"
                  onClick={() => handleMusicChoice(true)}
                >
                  Yes
                </button>
                <button
                  className="music-choice-btn no-btn"
                  onClick={() => handleMusicChoice(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      
        {showOpening && (
          <StardewFade logoSrc={logo} secondLogoSrc={secondLogo} />
        )}
      </div>
    </Router>
  );
}

export default App;