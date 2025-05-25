// src/game/useCamera.js
import { useState, useEffect } from 'react';

function useCamera({
  characterWorldPosition,
  mapDimensions,
  viewportWidth,
  viewportHeight,
  characterViewportOffsetX,
  characterViewportOffsetY,
  assetsReady,
}) {
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!assetsReady || !mapDimensions.width || !mapDimensions.height) {
      return;
    }

    let targetCameraX = characterWorldPosition.x - characterViewportOffsetX;
    let targetCameraY = characterWorldPosition.y - characterViewportOffsetY;

    targetCameraX = Math.max(0, Math.min(targetCameraX, mapDimensions.width - viewportWidth));
    targetCameraY = Math.max(0, Math.min(targetCameraY, mapDimensions.height - viewportHeight));

    // PERBAIKAN: Hanya panggil setCameraPosition jika nilainya benar-benar berubah
    if (cameraPosition.x !== targetCameraX || cameraPosition.y !== targetCameraY) {
      setCameraPosition({ x: targetCameraX, y: targetCameraY }); // Ini adalah baris yang dimaksud (sekitar baris 28)
    }
  }, [
    characterWorldPosition,
    mapDimensions,
    viewportWidth,
    viewportHeight,
    characterViewportOffsetX,
    characterViewportOffsetY,
    assetsReady,
    // Penting: cameraPosition.x dan cameraPosition.y tidak perlu ditambahkan di sini
    // karena kita membaca cameraPosition dari closure untuk perbandingan.
    // Menambahkannya akan membuat efek ini bergantung pada outputnya sendiri secara langsung.
  ]);

  return { cameraPosition };
}

export default useCamera;