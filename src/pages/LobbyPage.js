import React, { useEffect, useRef } from 'react';
import '../style.css';
import { Link } from 'react-router-dom';
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

  useEffect(() => {
    const starsContainer = starsContainerRef.current;
    if (!starsContainer) return;
  }, []);

  return (
    <div className="container-fluid p-0">
      <div id="stars" ref={starsContainerRef}>
        {Array.from({ length: 50 }, (_, i) => <Star key={i} />)}
      </div>

      <Cloud src={cloud1} alt="Cloud 1" />
      <Cloud src={cloud2} alt="Cloud 2" />
      <Cloud src={cloud6} alt="Cloud 3" />
      <Cloud src={cloud4} alt="Cloud 4" />
      <Cloud src={cloud5} alt="Cloud 5" />
      <Cloud src={cloud3} alt="Cloud 6" />

      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="title-box-lobby" style={{ padding: '20px', maxWidth: '100%' }}>
            <div className="corner top-left"></div>
            <div className="corner top-right"></div>
            <div className="corner bottom-left"></div>
            <div className="corner bottom-right"></div>

            <h1 className="h4 fw-bold" style={{ fontSize: '2rem', marginBottom: '15px' }}>
              Katak Petualang
            </h1>

            <div className="d-flex justify-content-center align-items-center mb-3">
              <button id="prev-avatar" className="btn nav-btn rounded-circle me-3">
                &#9665;
              </button>
              <img
                id="avatar"
                src={grayAvatar}
                alt="Avatar"
                className="img-fluid rounded-circle"
                style={{ width: '120px', height: '120px', objectFit: 'cover', border: '5px solid #a06a3f' }}
              />
              <button id="next-avatar" className="btn nav-btn rounded-circle ms-3">
                &#9655;
              </button>
            </div>

            <div className="mt-4">
              <input
                type="text"
                id="player-name"
                className="form-control mb-3 text-center"
                placeholder="Enter your name here..."
                style={{ border: '3px solid #a06a3f', backgroundColor: '#f5d090', color: '#874e1f' }}
              />
              <Link to="/main" className="start-button button-link" style={{ width: '100%', marginBottom: '10px' }}>
                Start Exploring
              </Link>
              <Link to="/" className="start-button button-link" style={{ width: '100%', fontSize: '1.5rem' }}>
                Back
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LobbyPage;