// src/pages/LobbyPage.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import '../style.css';
import { Link, useNavigate } from 'react-router-dom';
import grayAvatar from '../assets/character/gray.png';
import greenAvatar from '../assets/character/green.png';
import redAvatar from '../assets/character/red.png';
import Cloud from '../components/Cloud';
import Star from '../components/Star';
import ElasticSlider from '../components/ElasticSlider';
import cloud1 from '../assets/cloud 1.png';
import cloud2 from '../assets/cloud 2.png';
import cloud3 from '../assets/cloud 3.png';
import cloud4 from '../assets/cloud 4.png';
import cloud5 from '../assets/cloud 5.png';
import cloud6 from '../assets/cloud 6.png';

const cloudImages = [cloud1, cloud2, cloud3, cloud4, cloud5, cloud6];

function LobbyPage() {
  const [playerName, setPlayerName] = useState('');
  const [currentAvatarIndex, setCurrentAvatarIndex] = useState(0);
  const [isAvatarAnimating, setIsAvatarAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const starsContainerRef = useRef(null);
  const avatars = [grayAvatar, greenAvatar, redAvatar];
  const avatarNames = ['Gray Frog', 'Green Frog', 'Red Frog'];
  const avatarDescriptions = [
    'A wise and balanced frog',
    'An agile and quick frog',
    'A strong and brave frog'
  ];
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const navigate = useNavigate();

  // Memoize clouds so they don't change on re-renders
  const clouds = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const img = cloudImages[Math.floor(Math.random() * cloudImages.length)];
      return <Cloud key={`cloud-${i}`} src={img} alt={`Cloud ${i + 1}`} />;
    });
  }, []);

  // Memoize stars as well for consistency
  const stars = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => (
      <Star key={`star-${i}`} />
    ));
  }, []);

  const handleInputChange = (e) => setPlayerName(e.target.value);

  const handleStartClick = () => {
    if (!playerName.trim()) return;
    setIsAvatarAnimating(true);
    localStorage.setItem('playerName', playerName);
    localStorage.setItem('playerAvatar', selectedAvatar);
    navigate('/main');
  };

  const handlePrevAvatar = () => {
    setCurrentAvatarIndex((prevIndex) => (prevIndex - 1 + avatars.length) % avatars.length);
    setIsAvatarAnimating(true);
  };

  const handleNextAvatar = () => {
    setCurrentAvatarIndex((prevIndex) => (prevIndex + 1) % avatars.length);
    setIsAvatarAnimating(true);
  };

  // Handler for ElasticSlider value change
  const handleVolumeChange = (val) => {
    setVolume(val / 100); // ElasticSlider gives 0-100, convert to 0-1
    // Tambahkan logic audio jika ada audio di halaman ini
  };

  useEffect(() => {
    setSelectedAvatar(avatars[currentAvatarIndex]);
  }, [currentAvatarIndex, avatars]);

  return (
    <div className="container-fluid p-0 page-fade">
      {/* Volume bar at the top right */}
      <div id="stars" ref={starsContainerRef}>
        {stars}
      </div>
      {clouds}

      <div className="lobby-content">
        <div className="title-box-lobby">
          <div className="wood-grain"></div>
          <h1 className="fw-bold">
            Character Selection
          </h1>

          <div className="avatar-carousel">
            <button 
              className="nav-btn" 
              onClick={handlePrevAvatar}
              title="Previous Character"
            >
              &#9665;
            </button>
            <div className={`avatar-display ${isAvatarAnimating ? 'avatar-bounce' : ''}`}
                 onAnimationEnd={() => setIsAvatarAnimating(false)}>
              <img
                src={selectedAvatar}
                alt="Avatar"
                className="img-fluid"
              />
            </div>
            <button 
              className="nav-btn" 
              onClick={handleNextAvatar}
              title="Next Character"
            >
              &#9655;
            </button>
          </div>

          <div className="character-info">
            <p className="avatar-name">
              {avatarNames[currentAvatarIndex]}
            </p>
            <p className="avatar-description">
              {avatarDescriptions[currentAvatarIndex]}
            </p>
          </div>

          <div className="mt-4 input-section">
            <div className="input-wrapper">
              <input
                type="text"
                className="lobby-input"
                placeholder="Enter your name here..."
                value={playerName}
                onChange={handleInputChange}
                maxLength={15}
              />
              <div className="name-length-indicator">
                {playerName.length}/15 characters
              </div>
              {/* <div className="name-preview">
                {playerName}
              </div> */}
            </div>
            <button
              onClick={handleStartClick}
              className={`start-button ${!playerName.trim() ? 'disabled' : ''}`}
              disabled={!playerName.trim()}
            >
              Start Exploring
            </button>
            <Link to="/" className="start-button button-link">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LobbyPage;
