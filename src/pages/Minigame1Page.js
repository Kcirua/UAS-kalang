// src/pages/Minigame1Page.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../style.css';
import PlayerStats from '../mainPage/Playerstats'; // Asumsi path
import StatusBarGrid from '../mainPage/StatusBarGrid'; // Asumsi path


function Minigame1Page() {
  const initialMinigamePosition = { x: 100, y: 100 }; // Sesuaikan
  return (
    <div className="container-fluid p-0">
      <div className="semua">
        <div className="text-center">
          <div className="row game-panel">
            <div className="col-9">
              <div className="ruangmainnya bg-white p-4 rounded shadow">
                
              </div>
            </div>
            <div className="col-3 align-items-start flex-column p-4 action-panel img-fluid">
              <div className="separator my-4 bg-white" style={{ height: '2px', opacity: '0.5' }}></div>
              <Link to="/main" className="start-button mt-4">
                Keluar Minigame
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Minigame1Page;