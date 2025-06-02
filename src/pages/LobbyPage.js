// src/pages/LobbyPage.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import '../style.css'; // [cite: 255]
import { Link, useNavigate } from 'react-router-dom'; // [cite: 255]
import grayAvatar from '../assets/character/gray.png'; // [cite: 255]
import greenAvatar from '../assets/character/green.png'; // [cite: 255]
import redAvatar from '../assets/character/red.png'; // [cite: 255]
import Cloud from '../components/Cloud'; // [cite: 256]
import Star from '../components/Star'; // [cite: 256]
import cloud1 from '../assets/cloud 1.png'; // [cite: 256]
import cloud2 from '../assets/cloud 2.png'; // [cite: 256]
import cloud3 from '../assets/cloud 3.png'; // [cite: 257]
import cloud4 from '../assets/cloud 4.png'; // [cite: 257]
import cloud5 from '../assets/cloud 5.png'; // [cite: 257]
import cloud6 from '../assets/cloud 6.png'; // [cite: 257]

const cloudImages = [cloud1, cloud2, cloud3, cloud4, cloud5, cloud6]; // [cite: 258]

function LobbyPage() {
  const [playerName, setPlayerName] = useState(''); // [cite: 259]
  const [currentAvatarIndex, setCurrentAvatarIndex] = useState(0); // [cite: 259]
  const [isAvatarAnimating, setIsAvatarAnimating] = useState(false); // [cite: 259]
  const starsContainerRef = useRef(null); // [cite: 259]
  const avatars = useMemo(() => [grayAvatar, greenAvatar, redAvatar], []); // [cite: 259, 260] // Memoize avatars array
  const avatarNames = useMemo(() => ['Gray Frog', 'Green Frog', 'Red Frog'], []); // [cite: 260]
  const avatarDescriptions = useMemo(() => [ // [cite: 260]
    'A wise and balanced frog', // [cite: 260]
    'An agile and quick frog', // [cite: 260]
    'A strong and brave frog' // [cite: 260]
  ], []);
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]); // [cite: 261]
  const navigate = useNavigate(); // [cite: 261]

  // BARU: useEffect untuk membersihkan localStorage terkait game sebelumnya
  useEffect(() => {
    console.log("LobbyPage mounted. Clearing previous game session data from localStorage.");
    localStorage.removeItem('katak_gameTime');
    localStorage.removeItem('katak_day');
    localStorage.removeItem('katak_stats');
    localStorage.removeItem('katak_currentMapKey');
    localStorage.removeItem('katak_characterPosition');
    // Anda juga bisa membersihkan sessionStorage jika ada item spesifik minigame lain
    // sessionStorage.removeItem('gameStateForMinigame'); // Contoh jika ada
    console.log("Previous game session data cleared.");
  }, []); // Array dependensi kosong berarti efek ini hanya berjalan sekali saat mount

  const clouds = useMemo(() => { // [cite: 261]
    return Array.from({ length: 6 }, (_, i) => { // [cite: 261]
      const img = cloudImages[Math.floor(Math.random() * cloudImages.length)]; // [cite: 261]
      return <Cloud key={`cloud-${i}`} src={img} alt={`Cloud ${i + 1}`} />; // [cite: 261]
    });
  }, []); // [cite: 262]

  const stars = useMemo(() => { // [cite: 262]
    return Array.from({ length: 50 }, (_, i) => ( // [cite: 262]
      <Star key={`star-${i}`} /> // [cite: 262]
    ));
  }, []); // [cite: 263]

  const handleInputChange = (e) => setPlayerName(e.target.value); // [cite: 263]

  const handleStartClick = () => { // [cite: 263]
    if (!playerName.trim()) return; // [cite: 263]
    setIsAvatarAnimating(true); // [cite: 263]
    // Simpan nama pemain dan avatar yang dipilih (atau yang sudah ada jika tidak diubah)
    localStorage.setItem('playerName', playerName.trim()); // [cite: 264]
    localStorage.setItem('playerAvatar', selectedAvatar); // [cite: 264]
    
    setTimeout(() => { // [cite: 264]
      navigate('/main'); // [cite: 264]
    }, 500); // [cite: 264]
  }; // [cite: 265]

  const handlePrevAvatar = () => { // [cite: 265]
    setCurrentAvatarIndex((prevIndex) => (prevIndex - 1 + avatars.length) % avatars.length); // [cite: 265]
    setIsAvatarAnimating(true); // [cite: 265]
  }; // [cite: 266]

  const handleNextAvatar = () => { // [cite: 266]
    setCurrentAvatarIndex((prevIndex) => (prevIndex + 1) % avatars.length); // [cite: 266]
    setIsAvatarAnimating(true); // [cite: 266]
  }; // [cite: 267]

  useEffect(() => { // [cite: 267]
    setSelectedAvatar(avatars[currentAvatarIndex]); // [cite: 267]
  }, [currentAvatarIndex, avatars]); // [cite: 268]

  // Efek untuk memuat nama pemain yang sudah ada jika ada
  useEffect(() => {
    const existingPlayerName = localStorage.getItem('playerName');
    if (existingPlayerName) {
      setPlayerName(existingPlayerName);
    }
    const existingPlayerAvatar = localStorage.getItem('playerAvatar');
    if (existingPlayerAvatar) {
        const avatarIndex = avatars.findIndex(avatar => avatar === existingPlayerAvatar);
        if (avatarIndex !== -1) {
            setCurrentAvatarIndex(avatarIndex);
            setSelectedAvatar(existingPlayerAvatar);
        }
    }
  }, [avatars]); // Jalankan saat avatars (dari useMemo) siap

  return (
    <div className="container-fluid p-0 page-fade"> {/* [cite: 268] */}
      <div id="stars" ref={starsContainerRef}> {/* [cite: 268] */}
        {stars} {/* [cite: 268] */}
      </div>

      {clouds} {/* [cite: 268] */}

      <div className="lobby-content"> {/* [cite: 268] */}
        <div className="title-box-lobby"> {/* [cite: 268] */}
          <div className="wood-grain"></div> {/* [cite: 268] */}
          <h1 className="fw-bold"> {/* [cite: 268] */}
            Character Selection
          </h1>

          <div className="avatar-carousel"> {/* [cite: 269] */}
            <button 
              className="nav-btn" 
              onClick={handlePrevAvatar} // [cite: 269]
              title="Previous Character" // [cite: 269]
            >
              &#9665; {/* [cite: 269] */}
            </button> {/* [cite: 270] */}
            <div className={`avatar-display ${isAvatarAnimating ? 'avatar-bounce' : ''}`} // [cite: 270]
                 onAnimationEnd={() => setIsAvatarAnimating(false)}> {/* [cite: 270] */}
              <img
                src={selectedAvatar} // [cite: 270]
                alt="Avatar" // [cite: 270]
                className="img-fluid" // [cite: 271]
              />
            </div>
            <button 
              className="nav-btn" 
              onClick={handleNextAvatar} // [cite: 271]
              title="Next Character" // [cite: 271]
            >
              &#9655; {/* [cite: 272] */}
            </button> {/* [cite: 273] */}
          </div>

          <div className="character-info"> {/* [cite: 273] */}
            <p className="avatar-name"> {/* [cite: 273] */}
              {avatarNames[currentAvatarIndex]} {/* [cite: 273] */}
            </p>
            <p className="avatar-description"> {/* [cite: 273] */}
              {avatarDescriptions[currentAvatarIndex]} {/* [cite: 273] */}
            </p>
          </div> {/* [cite: 274] */}

          <div className="mt-4 input-section"> {/* [cite: 274] */}
            <div className="input-wrapper"> {/* [cite: 274] */}
              <input
                type="text" // [cite: 274]
                className="lobby-input" // [cite: 274]
                placeholder="Enter your name here..." // [cite: 274]
                value={playerName} // [cite: 275]
                onChange={handleInputChange} // [cite: 275]
                maxLength={15} // [cite: 275]
              />
              <div className="name-length-indicator m-1"> {/* [cite: 275] */}
                {playerName.length}/15 characters {/* [cite: 275] */}
              </div> {/* [cite: 276] */}
            </div>
            <button
              onClick={handleStartClick} // [cite: 276]
              className={`start-button ${!playerName.trim() ? 'disabled' : ''}`} // [cite: 276, 277]
              disabled={!playerName.trim()} // [cite: 277]
            >
              Start Exploring {/* [cite: 277] */}
            </button>
            <Link to="/" className="start-button button-link"> {/* [cite: 277] */}
              Back to Home {/* [cite: 277] */}
            </Link>
          </div> {/* [cite: 278] */}
        </div>
      </div>
    </div>
  ); // [cite: 279]
}

export default LobbyPage;