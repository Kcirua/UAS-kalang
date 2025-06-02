// src/App.js
import React, { useRef, useEffect, useState } from 'react'; // [cite: 357]
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'; // [cite: 357]
import { CSSTransition, TransitionGroup } from 'react-transition-group'; // [cite: 358]
import Background from './components/Background'; // [cite: 358]
import IndexPage from './pages/IndexPage'; // [cite: 358]
import LobbyPage from './pages/LobbyPage'; // [cite: 359]
import MainPage from './pages/MainPage'; // [cite: 359]
import GameOverPage from './pages/GameOverPage'; // [cite: 359]
import Minigame1Page from './pages/Minigame1Page'; // BARU: Impor halaman minigame
import './style.css'; // [cite: 359]
import bgMusicFile from './assets/audio/bg-music.mp3'; // [cite: 360]
import StardewFade from './components/StardewFade'; // [cite: 360]
import logo from './assets/logoStudio.png'; // [cite: 360]
import secondLogo from './assets/secondLogo.png'; // [cite: 360]
import Cloud from './components/Cloud'; // [cite: 360]
import Star from './components/Star'; // [cite: 361]
import cloud1 from './assets/cloud 1.png'; // [cite: 361]
import cloud2 from './assets/cloud 2.png'; // [cite: 361]
import cloud3 from './assets/cloud 3.png'; // [cite: 361]
import cloud4 from './assets/cloud 4.png'; // [cite: 362]
import cloud5 from './assets/cloud 5.png'; // [cite: 362]
import cloud6 from './assets/cloud 6.png'; // [cite: 362]

const cloudImages = [cloud1, cloud2, cloud3, cloud4, cloud5, cloud6]; // [cite: 362]

const routeRefs = { // [cite: 363]
  '/': React.createRef(), // [cite: 363]
  '/lobby': React.createRef(), // [cite: 363]
  '/main': React.createRef(), // [cite: 363]
  '/gameover': React.createRef(), // [cite: 363]
  '/minigame1': React.createRef(), // BARU: Ref untuk rute minigame
}; // [cite: 363]

function AnimatedRoutes() {
  const location = useLocation(); // [cite: 364]
  const nodeRef = routeRefs[location.pathname] || React.createRef(); // [cite: 364]
  return (
    <TransitionGroup component={null}> {/* [cite: 364] */}
      <CSSTransition
        key={location.pathname} // [cite: 364]
        classNames="page-fade" // [cite: 364]
        timeout={800} // [cite: 364]
        nodeRef={nodeRef} // [cite: 364]
        unmountOnExit // [cite: 364]
      >
        <div ref={nodeRef} className="page-container"> {/* [cite: 364] */}
          <Routes location={location}> {/* [cite: 364] */}
            <Route path="/" element={<IndexPage />} /> {/* [cite: 365] */}
            <Route path="/lobby" element={<LobbyPage />} /> {/* [cite: 365] */}
            <Route path="/main" element={<MainPage />} /> {/* [cite: 365] */}
            <Route path="/gameover" element={<GameOverPage />} /> {/* [cite: 365] */}
            <Route path="/minigame1" element={<Minigame1Page />} /> {/* BARU: Rute untuk minigame */}
          </Routes>
        </div>
      </CSSTransition>
    </TransitionGroup>
  ); // [cite: 366]
}

function App() {
  const [showOverlay, setShowOverlay] = useState(true); // [cite: 367]
  const [showMusicPrompt, setShowMusicPrompt] = useState(false); // [cite: 367]
  const [showOpening, setShowOpening] = useState(false); // [cite: 367]
  const [audioEnabled, setAudioEnabled] = useState(false); // [cite: 367]
  const [volume, setVolume] = useState(0.5); // Default volume at 50% // [cite: 368]
  const audioRef = useRef(null); // [cite: 368]
  const starsContainerRef = useRef(null); // [cite: 368]

  const clouds = Array.from({ length: 10 }, (_, i) => { // [cite: 369]
    const img = cloudImages[Math.floor(Math.random() * cloudImages.length)]; // [cite: 369]
    return <Cloud key={i} src={img} alt={`Cloud ${i + 1}`} />; // [cite: 369]
  }); // [cite: 369]

  useEffect(() => { // [cite: 370]
    const timer = setTimeout(() => { // [cite: 370]
      setShowOverlay(false); // [cite: 370]
      setShowMusicPrompt(true); // [cite: 370]
    }, 2000); // [cite: 370]

    return () => clearTimeout(timer); // [cite: 370]
  }, []); // [cite: 370]
  
  useEffect(() => { // [cite: 371]
    if (audioRef.current) { // [cite: 371]
      audioRef.current.volume = volume; // [cite: 371]
    }
  }, [volume]); // [cite: 371]

  const handleMusicChoice = (choice) => { // [cite: 372]
    setShowMusicPrompt(false); // [cite: 372]
    if (choice && audioRef.current) { // [cite: 372]
      setAudioEnabled(true); // [cite: 372]
      audioRef.current.volume = volume; // [cite: 372]
      audioRef.current.play(); // [cite: 373]
    }
    setShowOpening(true); // [cite: 373]
    const timer = setTimeout(() => { // [cite: 373]
      setShowOpening(false); // [cite: 374]
    }, 14000); // [cite: 374]
    return () => clearTimeout(timer); // [cite: 374]
  };

  const toggleAudio = () => { // [cite: 375]
    if (audioRef.current) { // [cite: 375]
      if (audioEnabled) { // [cite: 375]
        audioRef.current.pause(); // [cite: 375]
      } else {
        audioRef.current.play(); // [cite: 375]
      }
      setAudioEnabled(!audioEnabled); // [cite: 376]
    }
  };

  const handleVolumeChange = (e) => { // [cite: 377]
    const newVolume = parseFloat(e.target.value); // [cite: 377]
    setVolume(newVolume); // [cite: 377]
  }; // [cite: 377]

  return (
    <Router> {/* [cite: 377] */}
      <div className="app-container"> {/* [cite: 378] */}
        <div className="persistent-background"> {/* [cite: 378] */}
          <div id="stars" ref={starsContainerRef}> {/* [cite: 378] */}
            {Array.from({ length: 50 }, (_, i) => <Star key={i} />)} {/* [cite: 378] */}
          </div>
          <div className="lobby-cloud-container"> {/* [cite: 378] */}
            {clouds} {/* [cite: 379] */}
          </div>
        </div>

        <div className="main-content"> {/* [cite: 379] */}
          <AnimatedRoutes />
        </div>

        {!showMusicPrompt && !showOpening && ( /* [cite: 379] */
          <div className="audio-controls"> {/* [cite: 379] */}
            <button
              className="audio-toggle" // [cite: 380]
              onClick={toggleAudio} // [cite: 380]
              aria-label={audioEnabled ? 'Mute' : 'Unmute'} // [cite: 380]
            >
              {audioEnabled ? '🔊' : '🔇'} {/* [cite: 380] */}
            </button>
            <input
              type="range" // [cite: 380]
              min="0" // [cite: 380]
              max="1" // [cite: 381]
              step="0.1" // [cite: 381]
              value={volume} // [cite: 381]
              onChange={handleVolumeChange} // [cite: 381]
              className="volume-slider" // [cite: 381]
              aria-label="Volume" // [cite: 381]
            />
          </div>
        )}
        <audio ref={audioRef} src={bgMusicFile} loop /> {/* [cite: 382] */}

        {showOverlay && <StardewFade />} {/* [cite: 382] */}
        {showMusicPrompt && ( /* [cite: 382] */
          <div className="music-prompt-overlay"> {/* [cite: 382] */}
            <div className="music-prompt-box"> {/* [cite: 383] */}
              <h2>Enable Music?</h2> {/* [cite: 383] */}
              <div className="music-prompt-buttons"> {/* [cite: 383] */}
                <button
                  className="music-choice-btn yes-btn" // [cite: 383]
                  onClick={() => handleMusicChoice(true)} // [cite: 383]
                >
                  Yes
                </button>
                <button
                  className="music-choice-btn no-btn" // [cite: 384]
                  onClick={() => handleMusicChoice(false)} // [cite: 384]
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      
        {showOpening && ( /* [cite: 385] */
          <StardewFade logoSrc={logo} secondLogoSrc={secondLogo} /> /* [cite: 386] */
        )}
      </div>
    </Router>
  ); // [cite: 386]
}

export default App; // [cite: 386]