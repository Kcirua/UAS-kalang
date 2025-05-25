// src/game/GameCanvas.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  VIEWPORT_WIDTH, VIEWPORT_HEIGHT, CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT,
  CHARACTER_VIEWPORT_OFFSET_X, CHARACTER_VIEWPORT_OFFSET_Y,
  DEFAULT_SPRITE_CONFIG, CHARACTER_STEP_SIZE, DEBUG_DRAW_COLLISION,
} from './gameConstants'; // [cite: 67]
import useGameAssets from './useGameAssets'; // [cite: 67]
import useCamera from './useCamera'; // [cite: 67]
import useCharacter from './useCharacter'; // [cite: 67]
import MinimapCanvas from '../pages/MinimapCanvas'; // [cite: 68]
import { getOverlappingTileType } from './collisionUtils'; // [cite: 68]
import { collisionMapsData } from './collisionData'; // [cite: 69]

function GameCanvas({
  mapImageSrc,
  characterImageSrc,
  currentMapKey,
  initialCharacterPosition,
  onMapTransitionRequest,
  // worldEntryFromHousePosition, // Sudah ada di MainPage
  // worldEntryFromSwampPosition, // Sudah ada di MainPage jika Anda menambahkannya
  // worldEntryFromCavePosition, // Prop baru jika diperlukan posisi spawn spesifik dari gua, dikelola di MainPage
}) {
  const canvasRef = useRef(null); // [cite: 70]
  const {
    mapImage, characterImage, mapDimensions, isCharacterImageLoaded, assetsReady
  } = useGameAssets(mapImageSrc, characterImageSrc); // [cite: 71]

  const {
    characterWorldPosition, updateWorldPosition, currentFrame,
    activeKeysRef, facingDirection, interactionKeyRef
  } = useCharacter({ // [cite: 72]
    initialPosition: initialCharacterPosition,
    spriteConfig: DEFAULT_SPRITE_CONFIG,
  });
  const [canInteractWithTransitionTile, setCanInteractWithTransitionTile] = useState(false);
  const [interactionTileType, setInteractionTileType] = useState(0);

  const { cameraPosition } = useCamera({ // [cite: 73]
    characterWorldPosition, mapDimensions, viewportWidth: VIEWPORT_WIDTH, viewportHeight: VIEWPORT_HEIGHT,
    characterViewportOffsetX: CHARACTER_VIEWPORT_OFFSET_X || VIEWPORT_WIDTH / 2,
    characterViewportOffsetY: CHARACTER_VIEWPORT_OFFSET_Y || VIEWPORT_HEIGHT / 2,
    assetsReady,
  });
  const activeCollisionMapConfig = collisionMapsData[currentMapKey]; // [cite: 74]

  const handleInteraction = useCallback(() => {
    if (interactionTileType === 2) { // Pintu (umum untuk keluar)
      if (currentMapKey === 'world') {
        console.log("INTERAKSI DENGAN PINTU RUMAH! MASUK RUMAH...");
        onMapTransitionRequest('house');
      } else if (currentMapKey === 'house' || currentMapKey === 'swamp' || currentMapKey === 'caves') {
        // Logika keluar dari rumah, rawa, atau gua kembali ke dunia
        console.log(`INTERAKSI DENGAN PINTU KELUAR DARI ${currentMapKey.toUpperCase()}! KEMBALI KE DUNIA...`);
        onMapTransitionRequest('world');
      }
    } else if (interactionTileType === 3) { // Pintu masuk rawa (dari dunia)
      if (currentMapKey === 'world') {
        console.log("INTERAKSI DENGAN RAWA! MASUK RAWA...");
        onMapTransitionRequest('swamp');
      }
      // Jika ada tile tipe 3 di dalam rawa dengan fungsi lain, tambahkan di sini.
      // Saat ini, keluar dari rawa menggunakan tile tipe 2.
    } else if (interactionTileType === 4) { // Pintu masuk gua (dari dunia)
      if (currentMapKey === 'world') {
        console.log("INTERAKSI DENGAN GUA! MASUK GUA...");
        onMapTransitionRequest('caves');
      }
      // Jika ada tile tipe 4 di dalam gua dengan fungsi lain, tambahkan di sini.
      // Saat ini, keluar dari gua menggunakan tile tipe 2.
    }
  }, [currentMapKey, onMapTransitionRequest, interactionTileType]); // [cite: 75]

  useEffect(() => {
    if (!assetsReady || !mapDimensions.width || !mapDimensions.height || !activeCollisionMapConfig) {
      setCanInteractWithTransitionTile(false);
      setInteractionTileType(0);
      return;
    }
    const currentTileType = getOverlappingTileType(
      characterWorldPosition.x, characterWorldPosition.y,
      CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT,
      activeCollisionMapConfig
    );
    // Bisa interaksi jika tile adalah pintu (2), rawa (3), atau gua (4)
    if (currentTileType === 2 || currentTileType === 3 || currentTileType === 4) {
      setCanInteractWithTransitionTile(true);
      setInteractionTileType(currentTileType);
    } else {
      setCanInteractWithTransitionTile(false);
      setInteractionTileType(0);
    }
  }, [characterWorldPosition, assetsReady, mapDimensions, activeCollisionMapConfig]); // [cite: 76]


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = VIEWPORT_WIDTH; // [cite: 128]
    canvas.height = VIEWPORT_HEIGHT; // [cite: 128]
    let animationFrameId;

    const drawGame = () => {
      // 1. Proses Interaksi
      if (interactionKeyRef.current && canInteractWithTransitionTile) { // [cite: 77]
        handleInteraction();
        interactionKeyRef.current = false; // [cite: 77]
      }

      // 2. Proses Input Gerakan dan Update Posisi
      const activeKeys = activeKeysRef.current; // [cite: 78]
      const currentX = characterWorldPosition.x; // [cite: 78]
      const currentY = characterWorldPosition.y; // [cite: 78]
      let attemptedMoveX = currentX; // [cite: 78]
      let attemptedMoveY = currentY; // [cite: 78]

      if (activeKeys && activeKeys.size > 0 && mapDimensions.width > 0 && mapDimensions.height > 0 && activeCollisionMapConfig) { // [cite: 78]
        if (activeKeys.has('arrowup') || activeKeys.has('w')) attemptedMoveY -= CHARACTER_STEP_SIZE; // [cite: 79]
        if (activeKeys.has('arrowdown') || activeKeys.has('s')) attemptedMoveY += CHARACTER_STEP_SIZE; // [cite: 80]
        if (activeKeys.has('arrowleft') || activeKeys.has('a')) attemptedMoveX -= CHARACTER_STEP_SIZE; // [cite: 81]
        if (activeKeys.has('arrowright') || activeKeys.has('d')) attemptedMoveX += CHARACTER_STEP_SIZE; // [cite: 82]
        
        attemptedMoveX = Math.max(0, Math.min(attemptedMoveX, mapDimensions.width - CHAR_DISPLAY_WIDTH)); // [cite: 83]
        attemptedMoveY = Math.max(0, Math.min(attemptedMoveY, mapDimensions.height - CHAR_DISPLAY_HEIGHT)); // [cite: 84]
      }

      let finalTargetX = currentX; // [cite: 85]
      let finalTargetY = currentY; // [cite: 85]

      if (activeCollisionMapConfig) {
        if (attemptedMoveX !== currentX) {
          const tileTypeX = getOverlappingTileType(attemptedMoveX, currentY, CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT, activeCollisionMapConfig); // [cite: 86]
          // Bisa lewat, pintu, rawa, atau gua
          if (tileTypeX === 0 || tileTypeX === 2 || tileTypeX === 3 || tileTypeX === 4) { // Memperbolehkan tile tipe 4
            finalTargetX = attemptedMoveX;
          }
        }
        if (attemptedMoveY !== currentY) {
          const tileTypeY = getOverlappingTileType(finalTargetX, attemptedMoveY, CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT, activeCollisionMapConfig); // [cite: 88]
          // Bisa lewat, pintu, rawa, atau gua
          if (tileTypeY === 0 || tileTypeY === 2 || tileTypeY === 3 || tileTypeY === 4) { // Memperbolehkan tile tipe 4
            finalTargetY = attemptedMoveY;
          }
        }
      } else {
        finalTargetX = attemptedMoveX; // [cite: 90]
        finalTargetY = attemptedMoveY; // [cite: 90]
      }
      
      if (finalTargetX !== currentX || finalTargetY !== currentY) {
        updateWorldPosition({ x: finalTargetX, y: finalTargetY }); // [cite: 91]
      }

      // 3. Gambar Semua Elemen Game
      context.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT); // [cite: 92]
      
      if (mapImage && mapDimensions.width > 0 && cameraPosition) {
        context.drawImage(mapImage, cameraPosition.x, cameraPosition.y, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, 0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT); // [cite: 93]
      }

      if (DEBUG_DRAW_COLLISION && activeCollisionMapConfig && activeCollisionMapConfig.data && cameraPosition) { // [cite: 94]
        const collisionDataArray = activeCollisionMapConfig.data; // [cite: 94]
        const tileW = activeCollisionMapConfig.tileWidth; // [cite: 94]
        const tileH = activeCollisionMapConfig.tileHeight; // [cite: 94]

        const startCol = Math.floor(cameraPosition.x / tileW); // [cite: 95]
        const endCol = Math.min(startCol + Math.ceil(VIEWPORT_WIDTH / tileW) + 1, collisionDataArray[0] ? collisionDataArray[0].length : 0); // [cite: 96]
        const startRow = Math.floor(cameraPosition.y / tileH); // [cite: 97]
        const endRow = Math.min(startRow + Math.ceil(VIEWPORT_HEIGHT / tileH) + 1, collisionDataArray.length); // [cite: 98]

        for (let r = Math.max(0, startRow); r < endRow; r++) {
          for (let c = Math.max(0, startCol); c < endCol; c++) {
            if (collisionDataArray[r] && collisionDataArray[r][c] !== 0) { 
              const tileWorldX = c * tileW; // [cite: 99]
              const tileWorldY = r * tileH; // [cite: 100]
              const tileViewportX = tileWorldX - cameraPosition.x; // [cite: 101]
              const tileViewportY = tileWorldY - cameraPosition.y; // [cite: 101]
              if (collisionDataArray[r][c] === 1) { 
                context.fillStyle = 'rgba(255, 0, 0, 0.3)'; // [cite: 102]
              } else if (collisionDataArray[r][c] === 2) { 
                context.fillStyle = 'rgba(0, 0, 255, 0.3)'; // [cite: 103]
              } else if (collisionDataArray[r][c] === 3) {
                context.fillStyle = 'rgba(0, 255, 0, 0.3)'; // Hijau untuk rawa
              } else if (collisionDataArray[r][c] === 4) { // Warna untuk tile gua
                context.fillStyle = 'rgba(128, 0, 128, 0.3)'; // Ungu untuk gua
              }
              context.fillRect(tileViewportX, tileViewportY, tileW, tileH); // [cite: 104]
            }
          }
        }
      }

      // Gambar Karakter (logika tidak berubah)
      if (cameraPosition && characterImage && isCharacterImageLoaded) { // [cite: 110]
        const characterViewportX = characterWorldPosition.x - cameraPosition.x; // [cite: 105]
        const characterViewportY = characterWorldPosition.y - cameraPosition.y; // [cite: 105]
        const sourceX = currentFrame * DEFAULT_SPRITE_CONFIG.frameWidth; // [cite: 106]
        let sourceY = 0; // [cite: 107]
        if (facingDirection === 'left') {
          sourceY = 4 * DEFAULT_SPRITE_CONFIG.frameHeight; // [cite: 108]
        } else { 
          sourceY = 0 * DEFAULT_SPRITE_CONFIG.frameHeight; // [cite: 109]
        }
        context.drawImage(
          characterImage, 
          sourceX, sourceY, // [cite: 109]
          DEFAULT_SPRITE_CONFIG.frameWidth, DEFAULT_SPRITE_CONFIG.frameHeight,
          characterViewportX, characterViewportY,
          CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT
        );
      }
      
      // Tampilkan prompt interaksi
      if (canInteractWithTransitionTile) { // [cite: 111]
        context.fillStyle = "white"; // [cite: 111]
        context.strokeStyle = "black"; // [cite: 112]
        context.lineWidth = 2; // [cite: 112]
        context.font = "bold 16px Arial"; // [cite: 113]
        context.textAlign = "center"; // [cite: 113]
        
        let promptText = "";
        if (interactionTileType === 2) { // Pintu keluar umum
            if (currentMapKey === 'world') promptText = "Tekan 'E' untuk Masuk Rumah"; // Ke rumah dari dunia
            else if (currentMapKey === 'house') promptText = "Tekan 'E' untuk Keluar Rumah";
            else if (currentMapKey === 'swamp') promptText = "Tekan 'E' untuk Keluar Rawa";
            else if (currentMapKey === 'caves') promptText = "Tekan 'E' untuk Keluar Gua";
        } else if (interactionTileType === 3) { // Pintu masuk Rawa dari dunia
            if (currentMapKey === 'world') promptText = "Tekan 'E' untuk Masuk Rawa";
            // Tidak ada prompt "Keluar Rawa" di sini karena keluar Rawa menggunakan tileType 2
        } else if (interactionTileType === 4) { // Pintu masuk Gua dari dunia
            if (currentMapKey === 'world') promptText = "Tekan 'E' untuk Masuk Gua";
            // Tidak ada prompt "Keluar Gua" di sini karena keluar Gua menggunakan tileType 2
        }

        const textX = characterWorldPosition.x - cameraPosition.x + (CHAR_DISPLAY_WIDTH / 2); // [cite: 115]
        const textY = characterWorldPosition.y - cameraPosition.y - 10; // [cite: 116]
        context.strokeText(promptText, textX, textY); // [cite: 117]
        context.fillStyle = "white"; // [cite: 118]
        context.fillText(promptText, textX, textY); // [cite: 118]
      }

      animationFrameId = requestAnimationFrame(drawGame); // [cite: 119]
    };

    if (assetsReady && activeCollisionMapConfig) { // [cite: 120]
      drawGame();
    } else {
      context.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT); // [cite: 121]
      context.font = "16px Arial"; context.fillStyle = "black"; // [cite: 121]
      context.textAlign = "center"; // [cite: 122]
      context.fillText("Loading assets...", VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2); // [cite: 123]
    }

    return () => {
      cancelAnimationFrame(animationFrameId); // [cite: 124]
    };
  }, [
    assetsReady, characterWorldPosition, mapDimensions, cameraPosition,
    updateWorldPosition, activeKeysRef, characterImage, isCharacterImageLoaded, mapImage,
    currentFrame, facingDirection, interactionKeyRef, 
    canInteractWithTransitionTile, handleInteraction,
    activeCollisionMapConfig,
    currentMapKey,
    interactionTileType
  ]); // [cite: 125]

  return (
    <div style={{ position: 'relative', width: `${VIEWPORT_WIDTH}px`, height: `${VIEWPORT_HEIGHT}px` }}> {/* [cite: 126] */}
      <canvas ref={canvasRef} style={{ border: '1px solid black', display: 'block' }} />
      <MinimapCanvas
        mapImage={mapImage} mapDimensions={mapDimensions}
        characterWorldPosition={characterWorldPosition} cameraPosition={cameraPosition}
        mainViewportWidth={VIEWPORT_WIDTH} mainViewportHeight={VIEWPORT_HEIGHT}
        assetsReady={assetsReady}
      />
    </div>
  );
}

export default GameCanvas;