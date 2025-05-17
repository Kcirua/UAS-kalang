import React, { useState, useEffect, useRef } from 'react';
import '../style.css';
import Cloud from '../components/Cloud';
import { Link } from 'react-router-dom';
import cloud1 from '../assets/cloud 1.png';
import cloud2 from '../assets/cloud 2.png';
import cloud3 from '../assets/cloud 3.png';
import cloud4 from '../assets/cloud 4.png';
import cloud5 from '../assets/cloud 5.png';
import cloud6 from '../assets/cloud 6.png';
import coinImage from '../assets/coin.png';
import Star from '../components/Star';

function MainPage() {
  const [gameTime, setGameTime] = useState(0);
  const [day, setDay] = useState(1);
  const gameSpeed = 5;
  const starsContainerRef = useRef(null);
  const secondsPerHour = 60;
  const hoursPerDay = 24;
  const secondsPerDay = secondsPerHour * hoursPerDay;

  useEffect(() => {
    const intervalId = setInterval(() => {
      setGameTime((prevTime) => prevTime + 1);
    }, 1000 / gameSpeed);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (gameTime > 0 && gameTime % secondsPerDay === 0) {
      setDay((prevDay) => prevDay + 1);
    }
  }, [gameTime]);

  function formatGameTime(time) {
    const totalSeconds = time;
    const hours = Math.floor(totalSeconds / secondsPerHour) % 24;
    const minutes = Math.floor((totalSeconds % secondsPerHour) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

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

      <div className="semua">
        <div className="text-center">
          <div className="row game-panel">
            <div className="col-8">
              <div className="row stat-bar">
                <div className="col-sm m-2 stat-box">
                  <span id="greeting"></span> <span id="player-name-display"></span>
                </div>
                <div className="col-sm m-2 stat-box" id="game-time">
                  Day {day}
                </div>
                <div className="col-sm m-2 stat-box" id="time">
                  {formatGameTime(gameTime)}
                </div>
                <div className="col-sm m-2 stat-box">
                  <img src={coinImage} width="8%" alt="Coin" /><span id="Money" className="ms-1">0</span>
                </div>
              </div>
              <div className="row stat-bar">
                <div className="col m-2 stat-box">
                  <label htmlFor="stat-makan" className="form-label">Status Makan</label>
                  <div className="progress">
                    <div id="stat-makan" className="progress-bar" role="progressbar" style={{ width: '100%' }} aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">100%</div>
                  </div>
                </div>
                <div className="col m-2 stat-box">
                  <label htmlFor="stat-tidur" className="form-label">Status Tidur</label>
                  <div className="progress">
                    <div id="stat-tidur" className="progress-bar" role="progressbar" style={{ width: '100%' }} aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">100%</div>
                  </div>
                </div>
                <div className="col m-2 stat-box">
                  <label htmlFor="stat-kesenangan" className="form-label">Status Kesenangan</label>
                  <div className="progress">
                    <div id="stat-kesenangan" className="progress-bar" role="progressbar" style={{ width: '100%' }} aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">100%</div>
                  </div>
                </div>
                <div className="col m-2 stat-box">
                  <label htmlFor="stat-kebersihan" className="form-label">Status Kebersihan</label>
                  <div className="progress">
                    <div id="stat-kebersihan" className="progress-bar" role="progressbar" style={{ width: '100%' }} aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">100%</div>
                  </div>
                </div>
              </div>
              <div className="ruangmainnya bg-white p-4 rounded shadow">
                <canvas style={{ width: '1000px' }} className="img-fluid"></canvas>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.7/gsap.min.js" integrity="sha512-f6bQMg6nkSRw/xfHw5BCbISe/dJjXrVGfz9BSDwhZtiErHwk7ifbmBEtF9vFW8UNIQPhV2uEFVyI/UHob9r7Cw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
                <script src="scriptGame/data/rumah.js"></script>
                <script src="scriptGame/data/rumahCollision.js"></script>
                <script src="scriptGame/data/collisions.js"></script>
                <script src="scriptGame/data/rawaCollision.js"></script>
                <script src="scriptGame/data/msk_rawa.js"></script>
                <script src="scriptGame/data/msk_sawah.js"></script>
                <script src="scriptGame/data/msk_gunung.js"></script>
                <script src="scriptGame/classes.js"></script>
                <script src="scriptGame/script.js"></script>
              </div>
            </div>
            <div className="col-4 align-items-start flex-column p-4 action-panel img-fluid">
              <div className="p-2 mb-2 location-indicator" style={{ display: 'none' }}>At home</div>
              <div className="action-buttons mb-4">
                <h5 className="text-white mb-3">Actions</h5>
                <div className="p-2" id="containerTombolTidur" style={{ display: 'none' }}>
                  <button className="btn btn-primary w-100 mb-2" id="tombolTambahTidur">Tidur</button>
                </div>
                <div className="p-2" id="containerTombolBersihBersih" style={{ display: 'none' }}>
                  <button className="btn btn-primary w-100 mb-2" id="tombolBersihBersih">Bersih-bersih</button>
                </div>
                <div className="p-2">
                  <button className="btn btn-primary w-100 mb-2" id="tombolMakan">Makan</button>
                </div>
                <div className="p-2">
                  <button className="btn btn-primary w-100 mb-2" id="tombolBermain">Bermain</button>
                </div>
              </div>
              <div className="separator my-4 bg-white" style={{ height: '2px', opacity: '0.5' }}></div>
              <div className="controls-section mt-2">
                <h5 className="text-white mb-3">Movement Controls</h5>
                <div className="joystick mt-4">
                  <div className="d-flex justify-content-center mb-2">
                    <button className="btn btn-primary" id="up" style={{ width: '60px', height: '60px', fontSize: '24px' }}>↑</button>
                  </div>
                  <div className="d-flex justify-content-center">
                    <button className="btn btn-warning me-2" id="left" style={{ width: '60px', height: '60px', fontSize: '24px' }}>←</button>
                    <button className="btn btn-warning ms-2" id="right" style={{ width: '60px', height: '60px', fontSize: '24px' }}>→</button>
                  </div>
                  <div className="d-flex justify-content-center mt-2">
                    <button className="btn btn-primary" id="down" style={{ width: '60px', height: '60px', fontSize: '24px' }}>↓</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;