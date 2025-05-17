// src/components/mainPage/MovementControls.js
import React from 'react';

// Fungsi event handler (onUp, onDown, dll.) akan dilewatkan sebagai props
// dari MainPage.js, karena mereka kemungkinan akan memanggil fungsi dalam GameCanvas.
// Untuk saat ini, GameCanvas menangani event keydown secara internal.
// Jika ingin tombol ini mengontrol GameCanvas, Anda perlu mekanisme komunikasi
// (misalnya, context API, event bus, atau callback props yang lebih dalam).
// Untuk sekarang, kita asumsikan tombol ini hanya contoh dan event keydown yang utama.
const MovementControls = ({ onUp, onDown, onLeft, onRight }) => (
  <div className="controls-section mt-2">
    <h5 className="text-white mb-3">Movement Controls</h5>
    <div className="joystick mt-4">
      <div className="d-flex justify-content-center mb-2">
        <button className="btn btn-primary" id="up" onClick={onUp} style={{ width: '55px', height: '45px', fontSize: '24px' }}>↑</button>
      </div>
      <div className="d-flex justify-content-center">
        <button className="btn btn-warning me-2" id="left" onClick={onLeft} style={{ width: '55px', height: '45px', fontSize: '24px' }}>←</button>
        <button className="btn btn-warning ms-2" id="right" onClick={onRight} style={{ width: '55px', height: '45px', fontSize: '24px' }}>→</button>
      </div>
      <div className="d-flex justify-content-center mt-2">
        <button className="btn btn-primary" id="down" onClick={onDown} style={{ width: '55px', height: '45px', fontSize: '24px' }}>↓</button>
      </div>
    </div>
  </div>
);

export default MovementControls;