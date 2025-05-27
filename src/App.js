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
import Cloud from './components/Cloud';
import Star from './components/Star';
import cloud1 from './assets/cloud 1.png';
import cloud2 from './assets/cloud 2.png';
import cloud3 from './assets/cloud 3.png';
import cloud4 from './assets/cloud 4.png';
import cloud5 from './assets/cloud 5.png';
import cloud6 from './assets/cloud 6.png';
import ElasticSlider from './components/ElasticSlider';

const cloudImages = [cloud1, cloud2, cloud3, cloud4, cloud5, cloud6];

const routeRefs = {
  '/': React.createRef(),
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
  const [volume, setVolume] = useState(0.5); // Default volume at 50%
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

  // Update audio volume when volume state changes
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

  return (
    <Router>
      <div className="app-container">
        {/* Persistent Background */}
        <div className="persistent-background">
          <div id="stars" ref={starsContainerRef}>
            {Array.from({ length: 50 }, (_, i) => <Star key={i} />)}
          </div>
          <div className="lobby-cloud-container">
            {clouds}
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <AnimatedRoutes />
        </div>

        {/* Audio Controls */}
        {!showMusicPrompt && !showOpening && (
          <div className="audio-controls">
            <button
              className="audio-toggle"
              onClick={toggleAudio}
              aria-label={audioEnabled ? 'Mute' : 'Unmute'}
            >
              {audioEnabled ? '🔊' : '🔇'}
            </button>
            <ElasticSlider
              defaultValue={volume * 100}
              maxValue={100}
              onChange={val => {
                setVolume(val / 100);
                if (audioRef.current) {
                  audioRef.current.volume = val / 100;
                }
              }}
            />
          </div>
        )}
        <audio ref={audioRef} src={bgMusicFile} loop />

        {/* Overlays */}
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
        
        {/* Logo Opening Sequence */}
        {showOpening && (
          <StardewFade logoSrc={logo} secondLogoSrc={secondLogo} />
        )}
      </div>
    </Router>
  );
}

export default App;