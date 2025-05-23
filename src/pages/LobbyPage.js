// src/pages/LobbyPage.js
import React, { useState, useEffect } from 'react';
import '../style.css';
import { Link, useNavigate } from 'react-router-dom';
import grayAvatar from '../assets/character/gray.png';
import greenAvatar from '../assets/character/green.png';
import redAvatar from '../assets/character/red.png';

function LobbyPage() {
  const [playerName, setPlayerName] = useState('');
  const [currentAvatarIndex, setCurrentAvatarIndex] = useState(0);
  const avatars = [grayAvatar, greenAvatar, redAvatar];
  const avatarNames = ['Gray Frog', 'Green Frog', 'Red Frog'];
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const navigate = useNavigate();

  const handleInputChange = (e) => setPlayerName(e.target.value);

  const handleStartClick = () => {
    localStorage.setItem('playerName', playerName);
    localStorage.setItem('playerAvatar', selectedAvatar);
    navigate('/');
  };

  const handlePrevAvatar = () => {
    setCurrentAvatarIndex((prevIndex) => (prevIndex - 1 + avatars.length) % avatars.length);
  };

  const handleNextAvatar = () => {
    setCurrentAvatarIndex((prevIndex) => (prevIndex + 1) % avatars.length);
  };

  useEffect(() => {
    setSelectedAvatar(avatars[currentAvatarIndex]);
  }, [currentAvatarIndex]);

  return (
    <div className="container-fluid page-fade">
      <div className="lobby-content">
        <div className="title-box-lobby">
          <h1 className="fw-bold mb-4">
            Katak Petualang
          </h1>

          <div className="avatar-carousel">
            <button className="nav-btn" onClick={handlePrevAvatar}>
              &#9665;
            </button>
            <div className="avatar-display">
              <img
                src={selectedAvatar}
                alt="Avatar"
                className="img-fluid"
              />
            </div>
            <button className="nav-btn" onClick={handleNextAvatar}>
              &#9655;
            </button>
          </div>

          <p className="avatar-name">
            {avatarNames[currentAvatarIndex]}
          </p>

          <div className="mt-4">
            <input
              type="text"
              className="lobby-input form-control mb-3"
              placeholder="Enter your name here..."
              value={playerName}
              onChange={handleInputChange}
            />
            <button
              onClick={handleStartClick}
              className="start-button"
              disabled={!playerName.trim()}
              style={{
                opacity: playerName.trim() ? 1 : 0.6,
                cursor: playerName.trim() ? 'pointer' : 'not-allowed'
              }}
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
