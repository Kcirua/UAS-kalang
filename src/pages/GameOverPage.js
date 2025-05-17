import React from 'react';
import '../style.css';
import { Link } from 'react-router-dom';
import Cloud from '../components/Cloud';
import cloud1 from '../assets/cloud 1.png';
import cloud2 from '../assets/cloud 2.png';
import cloud3 from '../assets/cloud 3.png';
import cloud4 from '../assets/cloud 4.png';
import cloud5 from '../assets/cloud 5.png';
import cloud6 from '../assets/cloud 6.png';

function GameOverPage() {
  return (
    <div className="container-fluid p-0">
      <div id="stars"></div>

      <Cloud src={cloud1} alt="Cloud 1" />
      <Cloud src={cloud2} alt="Cloud 2" />
      <Cloud src={cloud6} alt="Cloud 3" />
      <Cloud src={cloud4} alt="Cloud 4" />
      <Cloud src={cloud5} alt="Cloud 5" />
      <Cloud src={cloud3} alt="Cloud 6" />

      <div className="row g-0">
        <div className="col-12">
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ minHeight: '100vh' }}
          >
            <div className="title-box">
              <div className="corner top-left"></div>
              <div className="corner top-right"></div>
              <div className="corner bottom-left"></div>
              <div className="corner bottom-right"></div>

              <div className="leaf leaf-topleft"></div>
              <div className="leaf leaf-topright"></div>
              <div className="leaf leaf-bottomright"></div>

              <h1>GAME OVER</h1>
            </div>

            <Link to="/lobby" className="start-button">
              TRY AGAIN
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameOverPage;