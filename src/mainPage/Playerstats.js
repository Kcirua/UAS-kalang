// src/components/mainPage/PlayerStats.js
import React from 'react';
import { formatGameTime } from '../utils/timeUtils'; // Impor dari lokasi baru
import coinImage from '../assets/coin.png'; // Sesuaikan path aset

const PlayerStats = ({ playerName, day, gameTime, money }) => (
  <div className="row stat-bar">
    <div className="col-sm m-2 stat-box">
      <span>Hello {playerName}</span>
      {/* Kode display:none dari file asli bisa dihilangkan jika tidak terpakai */}
      {/* <span id="greeting" style={{ display: 'none' }}></span> */}
      {/* <span id="player-name-display" style={{ display: 'none' }}></span> */}
    </div>
    <div className="col-sm m-2 stat-box" id="game-time">
      Day {day}
    </div>
    <div className="col-sm m-2 stat-box" id="time">
      {formatGameTime(gameTime)}
    </div>
    <div className="col-sm m-2 stat-box">
      <img src={coinImage} width="8%" alt="Coin" /><span id="Money" className="ms-1">{money}</span>
    </div>
  </div>
);

export default PlayerStats;