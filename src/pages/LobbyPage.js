// src/pages/LobbyPage.js
import React, { useState, useEffect, useRef } from 'react';
import '../style.css';
import { Link, useNavigate } from 'react-router-dom';
import Cloud from '../components/Cloud';
import cloud1 from '../assets/cloud 1.png';
import cloud2 from '../assets/cloud 2.png';
import cloud3 from '../assets/cloud 3.png';
import cloud4 from '../assets/cloud 4.png';
import cloud5 from '../assets/cloud 5.png';
import cloud6 from '../assets/cloud 6.png';
import grayAvatar from '../assets/character/gray.png';
import greenAvatar from '../assets/character/green.png';
import redAvatar from '../assets/character/red.png';
import Star from '../components/Star';

function LobbyPage() {
  const starsContainerRef = useRef(null);
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
    <div className="container-fluid p-0 page-fade">
      <div id="stars" ref={starsContainerRef}>
        {Array.from({ length: 50 }, (_, i) => <Star key={i} />)}
      </div>

      {/* Clouds */}
      {[cloud1, cloud2, cloud3, cloud4, cloud5, cloud6].map((cloud, i) => (
        <Cloud key={i} src={cloud} alt={`Cloud ${i + 1}`} />
      ))}

      {/* Floating Leaves */}
      <div className="floating-leaf" style={{ left: '20%' }} />
      <div className="floating-leaf" style={{ left: '70%' }} />


      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="title-box-lobby" style={{ padding: '20px', maxWidth: '100%' }}>
            <div className="corner top-left" />
            <div className="corner top-right" />
            <div className="corner bottom-left" />
            <div className="corner bottom-right" />

            <h1 className="h4 fw-bold" style={{ fontSize: '2rem', marginBottom: '15px' }}>
              Katak Petualang
            </h1>

            <div className="d-flex justify-content-center align-items-center mb-3 avatar-carousel">
              <button className="btn nav-btn rounded-circle me-3" onClick={handlePrevAvatar}>
                &#9665;
              </button>
              <img
                id="avatar"
                src={selectedAvatar}
                alt="Avatar"
                className="img-fluid rounded-circle"
                style={{
                  width: '120px',
                  height: '120px',
                  objectFit: 'cover',
                  border: '5px solid #a06a3f',
                  transition: 'transform 0.3s, opacity 0.3s'
                }}
              />
              <button className="btn nav-btn rounded-circle ms-3" onClick={handleNextAvatar}>
                &#9655;
              </button>
            </div>

            <p className="text-center mt-2" style={{ color: '#874e1f', fontWeight: 'bold' }}>
              {avatarNames[currentAvatarIndex]}
            </p>

            <div className="mt-4">
              <input
                type="text"
                className="form-control mb-3 text-center"
                placeholder="Enter your name here..."
                value={playerName}
                onChange={handleInputChange}
              />
              <button
                onClick={handleStartClick}
                className="start-button"
                disabled={!playerName.trim()}
                style={{
                  width: '100%',
                  marginBottom: '10px',
                  opacity: playerName.trim() ? 1 : 0.6,
                  cursor: playerName.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Start Exploring
              </button>
              <Link to="/" className="start-button button-link" style={{ width: '100%', fontSize: '1.5rem' }}>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LobbyPage;
