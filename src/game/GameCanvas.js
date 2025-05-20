// src/game/GameCanvas.js
import React, { useRef, useEffect, useState } from 'react';

// Ukuran viewport canvas (jendela game yang terlihat)
const VIEWPORT_WIDTH = 760; // Sesuaikan dengan ukuran yang kamu inginkan untuk tampilan game
const VIEWPORT_HEIGHT = 500;

// Karakter akan coba diposisikan di tengah viewport
const CHARACTER_VIEWPORT_OFFSET_X = VIEWPORT_WIDTH / 2;
const CHARACTER_VIEWPORT_OFFSET_Y = VIEWPORT_HEIGHT / 2;

// Ukuran karakter (bisa disesuaikan atau diambil dari gambar nantinya)
const CHAR_WIDTH = 64;
const CHAR_HEIGHT = 64;


function GameCanvas({ mapImageSrc, characterImageSrc }) {
  const canvasRef = useRef(null);
  // Posisi karakter dalam koordinat DUNIA (seluruh peta)
  const [characterWorldPosition, setCharacterWorldPosition] = useState({ x: 1335, y: 1760 }); // Posisi awal di dunia
  // Posisi kamera (sudut kiri atas viewport) dalam koordinat DUNIA
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });
  // State untuk menyimpan dimensi asli peta
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });

  const mapImageRef = useRef(new Image());
  const characterImageRef = useRef(new Image());

  // Efek untuk memuat gambar dan mendapatkan dimensi peta
  useEffect(() => {
    const mapImg = mapImageRef.current;
    mapImg.src = mapImageSrc;
    mapImg.onload = () => {
      setMapDimensions({ width: mapImg.width, height: mapImg.height });
      // Inisialisasi posisi kamera agar karakter di tengah jika memungkinkan
      updateCameraPosition(characterWorldPosition, { width: mapImg.width, height: mapImg.height });
    };

    const charImg = characterImageRef.current;
    charImg.src = characterImageSrc;
    // charImg.onload = () => { /* bisa tambahkan sesuatu jika perlu setelah char load */ }

  }, [mapImageSrc, characterImageSrc]); // Hanya dijalankan saat source gambar berubah


  // Fungsi untuk memperbarui posisi kamera
  const updateCameraPosition = (charPos, currentMapDimensions) => {
    if (!currentMapDimensions.width || !currentMapDimensions.height) return; // Jangan update jika map belum termuat

    let targetCameraX = charPos.x - CHARACTER_VIEWPORT_OFFSET_X;
    let targetCameraY = charPos.y - CHARACTER_VIEWPORT_OFFSET_Y;

    // Batasi kamera agar tidak keluar dari batas peta
    targetCameraX = Math.max(0, Math.min(targetCameraX, currentMapDimensions.width - VIEWPORT_WIDTH));
    targetCameraY = Math.max(0, Math.min(targetCameraY, currentMapDimensions.height - VIEWPORT_HEIGHT));

    setCameraPosition({ x: targetCameraX, y: targetCameraY });
  };


  // Efek untuk menggambar game dan loop animasi
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = VIEWPORT_WIDTH;
    canvas.height = VIEWPORT_HEIGHT;

    const mapImg = mapImageRef.current;
    const charImg = characterImageRef.current;

    let animationFrameId;

    const drawGame = () => {
      // Bersihkan canvas (viewport)
      context.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

      // Gambar bagian peta yang terlihat oleh kamera
      if (mapImg.complete && mapDimensions.width > 0) {
        context.drawImage(
          mapImg,
          cameraPosition.x, // sx (source x - dari mana mulai mengambil gambar di peta)
          cameraPosition.y, // sy (source y)
          VIEWPORT_WIDTH,   // sWidth (lebar area yang diambil dari peta)
          VIEWPORT_HEIGHT,  // sHeight (tinggi area yang diambil dari peta)
          0,                // dx (destination x - di mana mulai menggambar di canvas)
          0,                // dy (destination y)
          VIEWPORT_WIDTH,   // dWidth (lebar gambar di canvas)
          VIEWPORT_HEIGHT   // dHeight (tinggi gambar di canvas)
        );
      }

      // Hitung posisi karakter relatif terhadap viewport
      const characterViewportX = characterWorldPosition.x - cameraPosition.x;
      const characterViewportY = characterWorldPosition.y - cameraPosition.y;

      // Gambar karakter
      if (charImg.complete) {
        context.drawImage(charImg, characterViewportX, characterViewportY, CHAR_WIDTH, CHAR_HEIGHT);
      }
      animationFrameId = requestAnimationFrame(drawGame);
    };

    drawGame();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [characterWorldPosition, cameraPosition, mapDimensions]); // Re-run draw if these change


  // Efek untuk menangani input pergerakan karakter
  useEffect(() => {
    const handleKeyDown = (event) => {
      setCharacterWorldPosition(prevPos => {
        let { x, y } = prevPos;
        const step = 15; // Jarak pergerakan karakter di dunia

        switch (event.key) {
          case 'ArrowUp':
          case 'w':
            y -= step;
            break;
          case 'ArrowDown':
          case 's':
            y += step;
            break;
          case 'ArrowLeft':
          case 'a':
            x -= step;
            break;
          case 'ArrowRight':
          case 'd':
            x += step;
            break;
          default:
            return prevPos;
        }

        // Batasi pergerakan karakter agar tidak keluar dari batas DUNIA (peta)
        // Asumsikan CHAR_WIDTH dan CHAR_HEIGHT adalah ukuran karakter
        if (mapDimensions.width > 0 && mapDimensions.height > 0) {
          x = Math.max(0, Math.min(x, mapDimensions.width - CHAR_WIDTH));
          y = Math.max(0, Math.min(y, mapDimensions.height - CHAR_HEIGHT));
        }
        
        // Setelah karakter bergerak, update posisi kamera
        updateCameraPosition({ x, y }, mapDimensions);

        return { x, y };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mapDimensions]); // Re-run if mapDimensions change to update movement boundaries


  return <canvas ref={canvasRef} style={{ border: '1px solid black', width: `${VIEWPORT_WIDTH}px`, height: `${VIEWPORT_HEIGHT}px` }} />;
}

export default GameCanvas;