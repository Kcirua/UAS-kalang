// src/game/MinimapCanvas.js
import React, { useRef, useEffect } from 'react';
import {
  MINIMAP_WIDTH,
  MINIMAP_HEIGHT,
  MINIMAP_CHARACTER_DOT_SIZE,
  MINIMAP_VIEWPORT_BORDER_COLOR,
  MINIMAP_CHARACTER_DOT_COLOR,
  CHAR_DISPLAY_WIDTH,
  CHAR_DISPLAY_HEIGHT
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
  // 1. Buat Ref untuk menyimpan canvas latar belakang yang sudah di-cache
  const minimapBgCacheRef = useRef(null);

  // 2. useEffect ini HANYA berjalan saat peta berganti (mapImage berubah).
  // Tugasnya adalah membuat cache latar belakang minimap.
  useEffect(() => {
    if (!assetsReady || !mapImage || !mapDimensions.width) {
      return;
    }
    
    // Buat canvas baru di memory untuk cache
    const cacheCanvas = document.createElement('canvas');
    cacheCanvas.width = MINIMAP_WIDTH;
    cacheCanvas.height = MINIMAP_HEIGHT;
    const cacheContext = cacheCanvas.getContext('2d');

    // Gambar peta yang besar ke canvas cache KECIL (operasi berat yang hanya dilakukan sekali)
    cacheContext.drawImage(mapImage, 0, 0, mapDimensions.width, mapDimensions.height, 0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);
    
    // Simpan canvas yang sudah berisi gambar latar belakang ke dalam Ref
    minimapBgCacheRef.current = cacheCanvas;

  }, [mapImage, mapDimensions, assetsReady]);


  // 3. useEffect ini berjalan SETIAP FRAME saat karakter/kamera bergerak.
  // Tugasnya adalah menggambar ulang elemen dinamis (karakter & viewport).
  useEffect(() => {
    const canvas = minimapCanvasRef.current;
    if (!canvas || !assetsReady || !minimapBgCacheRef.current) {
      return;
    }
    const context = canvas.getContext('2d');
    canvas.width = MINIMAP_WIDTH;
    canvas.height = MINIMAP_HEIGHT;

    // 4. Gambar latar belakang dari cache (OPERASI SANGAT RINGAN)
    // Kita hanya menyalin gambar kecil yang sudah jadi, bukan memproses ulang.
    context.drawImage(minimapBgCacheRef.current, 0, 0);

    // Gambar kotak viewport utama
    if (cameraPosition) {
      const scaleX = canvas.width / mapDimensions.width;
      const scaleY = canvas.height / mapDimensions.height;
      const viewportRectX = cameraPosition.x * scaleX;
      const viewportRectY = cameraPosition.y * scaleY;
      const viewportRectWidth = mainViewportWidth * scaleX;
      const viewportRectHeight = mainViewportHeight * scaleY;
      context.strokeStyle = MINIMAP_VIEWPORT_BORDER_COLOR;
      context.lineWidth = 1;
      context.strokeRect(viewportRectX, viewportRectY, viewportRectWidth, viewportRectHeight);
    }

    // Gambar posisi karakter (titik kecil)
    if (characterWorldPosition) {
      const scaleX = canvas.width / mapDimensions.width;
      const scaleY = canvas.height / mapDimensions.height;
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
    assetsReady,
    mapDimensions,
    characterWorldPosition,
    cameraPosition,
    mainViewportWidth,
    mainViewportHeight
  ]);

  if (!assetsReady) {
    return null;
  }

  return (
    <canvas
      ref={minimapCanvasRef}
      style={{
        border: '1px solid #555',
        position: 'absolute',
        top: '10px',
        left: '10px',
        borderRadius: '20px',
        backgroundColor: 'rgba(0,0,0,0.3)',
        zIndex: 10
      }}
    />
  );
}

export default MinimapCanvas;