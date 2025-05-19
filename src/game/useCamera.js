// src/game/useCamera.js
import { useState, useEffect } from 'react';

function useCamera({
  characterWorldPosition,
  mapDimensions,
  viewportWidth,
  viewportHeight,
  characterViewportOffsetX,
  characterViewportOffsetY,
  assetsReady, // Untuk memastikan mapDimensions valid
}) {
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!assetsReady || !mapDimensions.width || !mapDimensions.height) {
      // Jangan update kamera jika aset (terutama peta) belum siap atau dimensi tidak valid
      return;
    }

    let targetCameraX = characterWorldPosition.x - characterViewportOffsetX;
    let targetCameraY = characterWorldPosition.y - characterViewportOffsetY;

    // Batasi kamera agar tidak keluar dari batas peta
    targetCameraX = Math.max(0, Math.min(targetCameraX, mapDimensions.width - viewportWidth));
    targetCameraY = Math.max(0, Math.min(targetCameraY, mapDimensions.height - viewportHeight));

    setCameraPosition({ x: targetCameraX, y: targetCameraY });

  }, [
    characterWorldPosition,
    mapDimensions,
    viewportWidth,
    viewportHeight,
    characterViewportOffsetX,
    characterViewportOffsetY,
    assetsReady
  ]);

  return { cameraPosition };
}

export default useCamera;