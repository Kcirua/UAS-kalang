// src/components/mainPage/MovementControls.js
import React from 'react';

// DIUBAH: Komponen ini sekarang mandiri dan tidak memerlukan props event handler.
const MovementControls = () => {
  // Fungsi helper untuk mengirim event keyboard palsu.
  // Ini memungkinkan kita untuk menggunakan kembali semua logika keyboard yang ada di useCharacter.js
  const dispatchKeyEvent = (type, key) => {
    window.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true }));
  };

  // Daftar tombol untuk dipetakan
  const controls = [
    { id: 'up', label: '↑', key: 'w' },
    { id: 'left', label: '←', key: 'a' },
    { id: 'right', label: '→', key: 'd' },
    { id: 'down', label: '↓', key: 's' },
  ];

  const handlePress = (key) => {
    dispatchKeyEvent('keydown', key);
  };

  const handleRelease = (key) => {
    dispatchKeyEvent('keyup', key);
  };

  return (
    <div className="controls-section mt-2">
      <h5 className="text-white mb-3">Movement Controls</h5>
      <div className="joystick mt-4">
        <div className="d-flex justify-content-center mb-2">
          {/* Tombol Atas */}
          <button
            className="btn btn-primary"
            id="up"
            style={{ width: '55px', height: '45px', fontSize: '24px' }}
            onMouseDown={() => handlePress('w')}
            onMouseUp={() => handleRelease('w')}
            onTouchStart={() => handlePress('w')}
            onTouchEnd={() => handleRelease('w')}
          >
            ↑
          </button>
        </div>
        <div className="d-flex justify-content-center">
          {/* Tombol Kiri */}
          <button
            className="btn btn-warning me-2"
            id="left"
            style={{ width: '55px', height: '45px', fontSize: '24px' }}
            onMouseDown={() => handlePress('a')}
            onMouseUp={() => handleRelease('a')}
            onTouchStart={() => handlePress('a')}
            onTouchEnd={() => handleRelease('a')}
          >
            ←
          </button>
          {/* Tombol Kanan */}
          <button
            className="btn btn-warning ms-2"
            id="right"
            style={{ width: '55px', height: '45px', fontSize: '24px' }}
            onMouseDown={() => handlePress('d')}
            onMouseUp={() => handleRelease('d')}
            onTouchStart={() => handlePress('d')}
            onTouchEnd={() => handleRelease('d')}
          >
            →
          </button>
        </div>
        <div className="d-flex justify-content-center mt-2">
          {/* Tombol Bawah */}
          <button
            className="btn btn-primary"
            id="down"
            style={{ width: '55px', height: '45px', fontSize: '24px' }}
            onMouseDown={() => handlePress('s')}
            onMouseUp={() => handleRelease('s')}
            onTouchStart={() => handlePress('s')}
            onTouchEnd={() => handleRelease('s')}
          >
            ↓
          </button>
        </div>
      </div>
    </div>
  );
};
export default MovementControls;