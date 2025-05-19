// src/game/MinimapCanvas.js
import React, { useRef, useEffect } from 'react';
import {
  MINIMAP_WIDTH,
  MINIMAP_HEIGHT,
  MINIMAP_CHARACTER_DOT_SIZE,
  MINIMAP_VIEWPORT_BORDER_COLOR,
  MINIMAP_CHARACTER_DOT_COLOR,
  CHAR_DISPLAY_WIDTH,  // Untuk akurasi posisi karakter di minimap
  CHAR_DISPLAY_HEIGHT // Untuk akurasi posisi karakter di minimap
} from '../game/gameConstants';

function MinimapCanvas({
  mapImage,
  mapDimensions,
  characterWorldPosition,
  cameraPosition,
  mainViewportWidth,
  mainViewportHeight,
  assetsReady,
}) {
  const minimapCanvasRef = useRef(null);

  useEffect(() => {
    if (!assetsReady || !mapImage || !mapDimensions.width || !minimapCanvasRef.current) {
      // Kosongkan canvas jika aset belum siap atau tidak ada map
      const canvas = minimapCanvasRef.current;
      if (canvas) {
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const canvas = minimapCanvasRef.current;
    const context = canvas.getContext('2d');

    // Sesuaikan ukuran canvas minimap dengan konstanta atau aspek rasio map
    // Untuk contoh ini, kita gunakan MINIMAP_WIDTH dan MINIMAP_HEIGHT langsung
    // Jika ingin menjaga aspek rasio peta:
    // const mapAspectRatio = mapDimensions.width / mapDimensions.height;
    // let actualMinimapWidth = MINIMAP_WIDTH;
    // let actualMinimapHeight = MINIMAP_WIDTH / mapAspectRatio;
    // if (actualMinimapHeight > MINIMAP_HEIGHT_MAX) { // Anda bisa definisikan MINIMAP_HEIGHT_MAX
    //   actualMinimapHeight = MINIMAP_HEIGHT_MAX;
    //   actualMinimapWidth = MINIMAP_HEIGHT_MAX * mapAspectRatio;
    // }
    // canvas.width = actualMinimapWidth;
    // canvas.height = actualMinimapHeight;

    canvas.width = MINIMAP_WIDTH;
    canvas.height = MINIMAP_HEIGHT;


    // Skala untuk menggambar di minimap
    const scaleX = canvas.width / mapDimensions.width;
    const scaleY = canvas.height / mapDimensions.height;

    // 1. Gambar peta keseluruhan (di-scale down)
    context.drawImage(mapImage, 0, 0, mapDimensions.width, mapDimensions.height, 0, 0, canvas.width, canvas.height);

    // 2. Gambar kotak viewport utama
    if (cameraPosition) {
      const viewportRectX = cameraPosition.x * scaleX;
      const viewportRectY = cameraPosition.y * scaleY;
      const viewportRectWidth = mainViewportWidth * scaleX;
      const viewportRectHeight = mainViewportHeight * scaleY;

      context.strokeStyle = MINIMAP_VIEWPORT_BORDER_COLOR;
      context.lineWidth = 1; // Bisa disesuaikan
      context.strokeRect(viewportRectX, viewportRectY, viewportRectWidth, viewportRectHeight);
    }

    // 3. Gambar posisi karakter (titik kecil)
    if (characterWorldPosition) {
      // Ambil titik tengah karakter untuk representasi yang lebih akurat
      const charCenterX = characterWorldPosition.x + (CHAR_DISPLAY_WIDTH / 2);
      const charCenterY = characterWorldPosition.y + (CHAR_DISPLAY_HEIGHT / 2);

      const charMinimapX = charCenterX * scaleX;
      const charMinimapY = charCenterY * scaleY;

      context.fillStyle = MINIMAP_CHARACTER_DOT_COLOR;
      context.beginPath();
      context.arc(charMinimapX, charMinimapY, MINIMAP_CHARACTER_DOT_SIZE / 2, 0, 2 * Math.PI);
      context.fill();
    }

  }, [
    mapImage,
    mapDimensions,
    characterWorldPosition,
    cameraPosition,
    mainViewportWidth,
    mainViewportHeight,
    assetsReady,
  ]);

  if (!assetsReady) {
    return null; // Atau tampilkan placeholder loading untuk minimap
  }

  return (
    <canvas
      ref={minimapCanvasRef}
      style={{
        border: '1px solid #555',
        position: 'absolute', // Penting untuk positionin
        top: '10px',          // Sesuaikan posisi
        left: '10px',         // Sesuaikan posisi
        borderRadius: '20px',
        backgroundColor: 'rgba(0,0,0,0.3)', // Sedikit transparan agar tidak terlalu mencolok
        zIndex: 10 // Pastikan di atas canvas utama jika bertumpuk
      }}
      // Lebar dan tinggi canvas diatur via JavaScript untuk pixel-perfect rendering
    />
  );
}

export default MinimapCanvas;