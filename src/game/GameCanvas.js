// src/game/GameCanvas.js
import React, { useState, useRef, useEffect, useCallback } from 'react'; // [cite: 58]
import {
  VIEWPORT_WIDTH, VIEWPORT_HEIGHT, CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT,
  CHARACTER_VIEWPORT_OFFSET_X, CHARACTER_VIEWPORT_OFFSET_Y, // [cite: 60]
  DEFAULT_SPRITE_CONFIG, CHARACTER_STEP_SIZE, DEBUG_DRAW_COLLISION,
} from './gameConstants';
import useGameAssets from './useGameAssets';
import useCamera from './useCamera';
import useCharacter from './useCharacter';
import MinimapCanvas from '../pages/MinimapCanvas'; // [cite: 61]
import { getOverlappingTileType } from './collisionUtils'; // [cite: 61]
import { collisionMapsData } from './collisionData'; // Mengimpor semua data peta kolisi [cite: 62]

function GameCanvas({
  mapImageSrc,
  characterImageSrc,
  currentMapKey, // Prop baru dari MainPage
  initialCharacterPosition, // Prop baru dari MainPage
  onMapTransitionRequest, // Callback ke MainPage
  worldEntryFromHousePosition, // Prop baru dari MainPage
}) {
  const canvasRef = useRef(null);

  const {
    mapImage, characterImage, mapDimensions, isCharacterImageLoaded, assetsReady
  } = useGameAssets(mapImageSrc, characterImageSrc); // [cite: 64] useGameAssets akan re-load jika mapImageSrc berubah

  const {
    characterWorldPosition, updateWorldPosition, currentFrame,
    activeKeysRef, facingDirection, interactionKeyRef
  } = useCharacter({ // [cite: 65]
    initialPosition: initialCharacterPosition, // Menggunakan initialCharacterPosition yang dinamis
    spriteConfig: DEFAULT_SPRITE_CONFIG,
  });

  const [canInteractWithDoor, setCanInteractWithDoor] = useState(false); // [cite: 66]

  const { cameraPosition } = useCamera({ // [cite: 66]
    characterWorldPosition, mapDimensions, viewportWidth: VIEWPORT_WIDTH, viewportHeight: VIEWPORT_HEIGHT,
    characterViewportOffsetX: CHARACTER_VIEWPORT_OFFSET_X || VIEWPORT_WIDTH / 2,
    characterViewportOffsetY: CHARACTER_VIEWPORT_OFFSET_Y || VIEWPORT_HEIGHT / 2,
    assetsReady,
  });

  // Mendapatkan konfigurasi peta kolisi aktif
  const activeCollisionMapConfig = collisionMapsData[currentMapKey];

  // Fungsi untuk menangani interaksi (masuk/keluar rumah)
  const handleInteraction = useCallback(() => {
    if (currentMapKey === 'world') {
      console.log("INTERAKSI DENGAN PINTU! MASUK RUMAH...");
      onMapTransitionRequest('house'); // Minta MainPage untuk ganti ke peta 'house'
    } else if (currentMapKey === 'house') {
      console.log("INTERAKSI DENGAN PINTU KELUAR! KEMBALI KE DUNIA...");
      // Saat keluar dari rumah, kita akan memberi tahu MainPage untuk menggunakan posisi spesifik
      onMapTransitionRequest('world'); // MainPage akan menangani spawn position
    }
  }, [currentMapKey, onMapTransitionRequest, worldEntryFromHousePosition]); // [cite: 67] (modifikasi dependensi)

  // Efek untuk memperbarui canInteractWithDoor
  useEffect(() => {
    if (!assetsReady || !mapDimensions.width || !mapDimensions.height || !activeCollisionMapConfig) {
      setCanInteractWithDoor(false);
      return;
    }
    const currentTileType = getOverlappingTileType(
      characterWorldPosition.x, characterWorldPosition.y,
      CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT,
      activeCollisionMapConfig // Menggunakan config peta aktif
    );
    setCanInteractWithDoor(currentTileType === 2); // Hanya bisa interaksi jika tile adalah pintu (tipe 2)
  }, [characterWorldPosition, assetsReady, mapDimensions, activeCollisionMapConfig]); // [cite: 68] (modifikasi dependensi)


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = VIEWPORT_WIDTH;
    canvas.height = VIEWPORT_HEIGHT;
    let animationFrameId;

    const drawGame = () => {
      // 1. Proses Interaksi
      if (interactionKeyRef.current && canInteractWithDoor) {
        handleInteraction(); // [cite: 69]
        interactionKeyRef.current = false; // Reset flag [cite: 69]
      }

      // 2. Proses Input Gerakan dan Update Posisi
      const activeKeys = activeKeysRef.current;
      const currentX = characterWorldPosition.x;
      const currentY = characterWorldPosition.y;
      let attemptedMoveX = currentX;
      let attemptedMoveY = currentY;

      if (activeKeys && activeKeys.size > 0 && mapDimensions.width > 0 && mapDimensions.height > 0 && activeCollisionMapConfig) {
        if (activeKeys.has('arrowup') || activeKeys.has('w')) attemptedMoveY -= CHARACTER_STEP_SIZE; // [cite: 70]
        if (activeKeys.has('arrowdown') || activeKeys.has('s')) attemptedMoveY += CHARACTER_STEP_SIZE; // [cite: 70]
        if (activeKeys.has('arrowleft') || activeKeys.has('a')) attemptedMoveX -= CHARACTER_STEP_SIZE; // [cite: 71]
        if (activeKeys.has('arrowright') || activeKeys.has('d')) attemptedMoveX += CHARACTER_STEP_SIZE; // [cite: 71]
        
        // Batasi gerakan dalam batas peta aktual
        attemptedMoveX = Math.max(0, Math.min(attemptedMoveX, mapDimensions.width - CHAR_DISPLAY_WIDTH)); // [cite: 72]
        attemptedMoveY = Math.max(0, Math.min(attemptedMoveY, mapDimensions.height - CHAR_DISPLAY_HEIGHT)); // [cite: 73]
      }

      let finalTargetX = currentX;
      let finalTargetY = currentY;

      if (activeCollisionMapConfig) { // Hanya cek kolisi jika ada config peta aktif
        // Cek pergerakan horizontal
        if (attemptedMoveX !== currentX) {
          const tileTypeX = getOverlappingTileType(attemptedMoveX, currentY, CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT, activeCollisionMapConfig); // [cite: 75]
          if (tileTypeX === 0 || tileTypeX === 2) { // Bisa lewat atau pintu [cite: 76]
            finalTargetX = attemptedMoveX;
          }
        }
        // Cek pergerakan vertikal
        if (attemptedMoveY !== currentY) {
          const tileTypeY = getOverlappingTileType(finalTargetX, attemptedMoveY, CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT, activeCollisionMapConfig); // [cite: 77]
          if (tileTypeY === 0 || tileTypeY === 2) { // Bisa lewat atau pintu [cite: 78]
            finalTargetY = attemptedMoveY;
          }
        }
      } else { // Jika tidak ada config peta (seharusnya tidak terjadi jika assetsReady), izinkan gerakan tanpa kolisi
        finalTargetX = attemptedMoveX;
        finalTargetY = attemptedMoveY;
      }
      
      if (finalTargetX !== currentX || finalTargetY !== currentY) {
        updateWorldPosition({ x: finalTargetX, y: finalTargetY }); // [cite: 79]
      }

      // 3. Gambar Semua Elemen Game
      context.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT); // [cite: 80]
      
      if (mapImage && mapDimensions.width > 0 && cameraPosition) {
        context.drawImage(mapImage, cameraPosition.x, cameraPosition.y, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, 0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT); // [cite: 81]
      }

      // Gambar Debug Kolisi (menggunakan data kolisi aktif)
      if (DEBUG_DRAW_COLLISION && activeCollisionMapConfig && activeCollisionMapConfig.data && cameraPosition) {
        const collisionDataArray = activeCollisionMapConfig.data;
        const tileW = activeCollisionMapConfig.tileWidth;
        const tileH = activeCollisionMapConfig.tileHeight;

        const startCol = Math.floor(cameraPosition.x / tileW); // [cite: 82]
        const endCol = Math.min(startCol + Math.ceil(VIEWPORT_WIDTH / tileW) + 1, collisionDataArray[0] ? collisionDataArray[0].length : 0); // [cite: 83]
        const startRow = Math.floor(cameraPosition.y / tileH); // [cite: 84]
        const endRow = Math.min(startRow + Math.ceil(VIEWPORT_HEIGHT / tileH) + 1, collisionDataArray.length); // [cite: 84]

        for (let r = Math.max(0, startRow); r < endRow; r++) {
          for (let c = Math.max(0, startCol); c < endCol; c++) {
            if (collisionDataArray[r] && collisionDataArray[r][c] !== 0) { 
              const tileWorldX = c * tileW; // [cite: 85]
              const tileWorldY = r * tileH; // [cite: 85]
              const tileViewportX = tileWorldX - cameraPosition.x;
              const tileViewportY = tileWorldY - cameraPosition.y; // [cite: 86]
              if (collisionDataArray[r][c] === 1) { 
                context.fillStyle = 'rgba(255, 0, 0, 0.3)'; // [cite: 87]
              } else if (collisionDataArray[r][c] === 2) { 
                context.fillStyle = 'rgba(0, 0, 255, 0.3)'; // Biru untuk pintu [cite: 88]
              }
              context.fillRect(tileViewportX, tileViewportY, tileW, tileH); // [cite: 89]
            }
          }
        }
      }

      // Gambar Karakter (logika tidak berubah)
      if (cameraPosition && characterImage && isCharacterImageLoaded) { // [cite: 90]
        const characterViewportX = characterWorldPosition.x - cameraPosition.x;
        const characterViewportY = characterWorldPosition.y - cameraPosition.y;
        const sourceX = currentFrame * DEFAULT_SPRITE_CONFIG.frameWidth; // [cite: 91]
        let sourceY = 0;
        if (facingDirection === 'left') {
          sourceY = 4 * DEFAULT_SPRITE_CONFIG.frameHeight; // [cite: 92]
        } else { 
          sourceY = 0 * DEFAULT_SPRITE_CONFIG.frameHeight; // [cite: 93]
        }
        context.drawImage(
          characterImage, 
          sourceX, sourceY, // [cite: 94]
          DEFAULT_SPRITE_CONFIG.frameWidth, DEFAULT_SPRITE_CONFIG.frameHeight, // [cite: 94]
          characterViewportX, characterViewportY, // [cite: 95]
          CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT // [cite: 95]
        );
      }
      
      // Tampilkan prompt interaksi
      if (canInteractWithDoor) {
        context.fillStyle = "white"; // [cite: 96]
        context.strokeStyle = "black"; // [cite: 96]
        context.lineWidth = 2;
        context.font = "bold 16px Arial";
        context.textAlign = "center"; // [cite: 97]
        const promptText = currentMapKey === 'world' ? "Tekan 'E' untuk Masuk" : "Tekan 'E' untuk Keluar";
        const textX = characterWorldPosition.x - cameraPosition.x + (CHAR_DISPLAY_WIDTH / 2); // [cite: 98]
        const textY = characterWorldPosition.y - cameraPosition.y - 10; // [cite: 98]
        context.strokeText(promptText, textX, textY); // [cite: 100]
        context.fillStyle = "white";
        context.fillText(promptText, textX, textY); // [cite: 101]
      }

      animationFrameId = requestAnimationFrame(drawGame);
    };

    if (assetsReady && activeCollisionMapConfig) { // Pastikan config peta juga siap
      drawGame(); // [cite: 102]
    } else {
      context.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
      context.font = "16px Arial"; context.fillStyle = "black"; // [cite: 103]
      context.textAlign = "center"; // [cite: 104]
      context.fillText("Loading assets...", VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2); // [cite: 104]
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    }; // [cite: 105]
  }, [
    assetsReady, characterWorldPosition, mapDimensions, cameraPosition,
    updateWorldPosition, activeKeysRef, characterImage, isCharacterImageLoaded, mapImage,
    currentFrame, facingDirection, interactionKeyRef, canInteractWithDoor, handleInteraction,
    activeCollisionMapConfig, // Tambahkan ini sebagai dependensi
    currentMapKey // Tambahkan ini juga karena memengaruhi promptText
  ]); // [cite: 106] (modifikasi dependensi)

  return (
    <div style={{ position: 'relative', width: `${VIEWPORT_WIDTH}px`, height: `${VIEWPORT_HEIGHT}px` }}>
      <canvas ref={canvasRef} style={{ border: '1px solid black', display: 'block' }} />
      {/* Minimap akan otomatis menggunakan mapImage yang aktif dari useGameAssets */}
      <MinimapCanvas
        mapImage={mapImage} mapDimensions={mapDimensions}
        characterWorldPosition={characterWorldPosition} cameraPosition={cameraPosition}
        mainViewportWidth={VIEWPORT_WIDTH} mainViewportHeight={VIEWPORT_HEIGHT}
        assetsReady={assetsReady}
      />
    </div>
  ); // [cite: 107]
}

export default GameCanvas;