// src/game/GameCanvas.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  VIEWPORT_WIDTH, VIEWPORT_HEIGHT, CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT,
  CHARACTER_VIEWPORT_OFFSET_X, CHARACTER_VIEWPORT_OFFSET_Y,
  DEFAULT_SPRITE_CONFIG, CHARACTER_STEP_SIZE, DEBUG_DRAW_COLLISION,
} from './gameConstants'; // [cite: 462, 463]
import useGameAssets from './useGameAssets'; // [cite: 463]
import useCamera from './useCamera'; // [cite: 463]
import useCharacter from './useCharacter'; // Impor default useCharacter
// SLEEP_SPRITE_CONFIG akan diambil dari characterHook.spriteConfigToUse jika isSleeping
import MinimapCanvas from '../pages/MinimapCanvas'; // [cite: 464]
import { getOverlappingTileType } from './collisionUtils'; // [cite: 465]
import { collisionMapsData } from './collisionData'; // [cite: 465]

function GameCanvas({
  mapImageSrc,
  characterImageSrc,
  currentMapKey,
  initialCharacterPosition,
  onMapTransitionRequest,
  onInteractionAvailable,      // Callback ke MainPage tentang tile interaktif
  isCharacterCurrentlySleeping, // Boolean dari MainPage untuk status tidur
  onBedInteraction,            // Callback ke MainPage saat 'E' ditekan di kasur (tile 99)
}) {
  const canvasRef = useRef(null); // [cite: 466]
  const {
    mapImage, characterImage, mapDimensions, isCharacterImageLoaded, assetsReady
  } = useGameAssets(mapImageSrc, characterImageSrc); // [cite: 467]

  const characterHook = useCharacter({ //
    initialPosition: initialCharacterPosition,
    spriteConfig: DEFAULT_SPRITE_CONFIG, // Ini akan menjadi default, useCharacter akan switch ke SLEEP_SPRITE_CONFIG jika tidur
  });
  const {
    characterWorldPosition, updateWorldPosition, currentFrame,
    activeKeysRef, facingDirection, interactionKeyRef,
    isSleeping,         // Status animasi tidur dari useCharacter
    setSleepingState,   // Fungsi untuk memberitahu useCharacter agar memulai/menghentikan animasi tidur
    spriteConfigToUse,  // Config sprite yang sedang aktif (normal atau tidur) dari useCharacter
  } = characterHook;

  // State lokal untuk interaksi tombol 'E'
  const [canInteractWithEKey, setCanInteractWithEKey] = useState(false);
  const [interactionTileTypeForEKey, setInteractionTileTypeForEKey] = useState(0);

  const { cameraPosition } = useCamera({ // [cite: 469, 470]
    characterWorldPosition, mapDimensions, viewportWidth: VIEWPORT_WIDTH, viewportHeight: VIEWPORT_HEIGHT,
    characterViewportOffsetX: CHARACTER_VIEWPORT_OFFSET_X || VIEWPORT_WIDTH / 2,
    characterViewportOffsetY: CHARACTER_VIEWPORT_OFFSET_Y || VIEWPORT_HEIGHT / 2,
    assetsReady,
  });
  const activeCollisionMapConfig = collisionMapsData[currentMapKey]; // [cite: 470]

  // Sinkronkan status tidur dari MainPage ke hook useCharacter
  useEffect(() => {
    if (setSleepingState) {
      setSleepingState(isCharacterCurrentlySleeping);
    }
  }, [isCharacterCurrentlySleeping, setSleepingState]);

  // Handler untuk interaksi tombol 'E'
  const handleEKeyInteraction = useCallback(() => {
    if (isSleeping) return; // Jangan lakukan interaksi jika sedang tidur

    if (interactionTileTypeForEKey === 2) { // Pintu Rumah / Gua [cite: 470, 471]
      if (currentMapKey === 'world') {
        onMapTransitionRequest('house');
      } else if (currentMapKey === 'house' || currentMapKey === 'caves') {
        onMapTransitionRequest('world');
      }
    } else if (interactionTileTypeForEKey === 3) { // Pintu Rawa [cite: 471, 472]
      if (currentMapKey === 'world') {
        onMapTransitionRequest('swamp');
      } else if (currentMapKey === 'swamp') { // Keluar dari rawa pakai tile 3
        onMapTransitionRequest('world');
      }
    } else if (interactionTileTypeForEKey === 4) { // Pintu Gua dari Dunia [cite: 472, 473]
      if (currentMapKey === 'world') {
        onMapTransitionRequest('caves');
      }
    } else if (interactionTileTypeForEKey === 99) { // Tempat Tidur
      if (onBedInteraction) {
        onBedInteraction(); // Panggil handler dari MainPage
      }
    }
  }, [currentMapKey, onMapTransitionRequest, interactionTileTypeForEKey, onBedInteraction, isSleeping]);

  // Deteksi tile interaktif untuk onInteractionAvailable dan tombol 'E'
  useEffect(() => {
    if (!assetsReady || !mapDimensions.width || !mapDimensions.height || !activeCollisionMapConfig) {
      setCanInteractWithEKey(false);
      setInteractionTileTypeForEKey(0);
      if (onInteractionAvailable) onInteractionAvailable(0);
      return;
    }
    // Hanya deteksi interaksi jika tidak sedang tidur
    let currentDetectedTileType = 0;
    if (!isSleeping) {
        currentDetectedTileType = getOverlappingTileType(
            characterWorldPosition.x, characterWorldPosition.y,
            CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT, activeCollisionMapConfig
        );
    }
    
    if (onInteractionAvailable) {
      onInteractionAvailable(currentDetectedTileType); // Kirim tipe tile ke MainPage
    }

    // Update state lokal untuk tombol 'E'
    if (!isSleeping && (currentDetectedTileType === 2 || currentDetectedTileType === 3 || currentDetectedTileType === 4 || currentDetectedTileType === 99)) { // [cite: 475]
      setCanInteractWithEKey(true);
      setInteractionTileTypeForEKey(currentDetectedTileType);
    } else {
      setCanInteractWithEKey(false);
      setInteractionTileTypeForEKey(0);
    }
  }, [characterWorldPosition, assetsReady, mapDimensions, activeCollisionMapConfig, onInteractionAvailable, isSleeping, CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT]);


  // Loop utama game untuk menggambar dan memproses input
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = VIEWPORT_WIDTH;
    canvas.height = VIEWPORT_HEIGHT;
    let animationFrameId;

    const drawGame = () => {
      // 1. Proses Interaksi Tombol 'E'
      if (interactionKeyRef.current && canInteractWithEKey && !isSleeping) { // [cite: 476, 477]
        handleEKeyInteraction();
        interactionKeyRef.current = false;
      }

      // 2. Proses Input Gerakan & Update Posisi (Hanya jika tidak tidur)
      if (!isSleeping) { //
        const activeKeys = activeKeysRef.current; // [cite: 478]
        const currentX = characterWorldPosition.x; // [cite: 478]
        const currentY = characterWorldPosition.y; // [cite: 478]
        let attemptedMoveX = currentX; // [cite: 478]
        let attemptedMoveY = currentY; // [cite: 478]

        if (activeKeys && activeKeys.size > 0 && mapDimensions.width > 0 && mapDimensions.height > 0 && activeCollisionMapConfig) { // [cite: 478]
          if (activeKeys.has('arrowup') || activeKeys.has('w')) attemptedMoveY -= CHARACTER_STEP_SIZE; // [cite: 479]
          if (activeKeys.has('arrowdown') || activeKeys.has('s')) attemptedMoveY += CHARACTER_STEP_SIZE; // [cite: 480]
          if (activeKeys.has('arrowleft') || activeKeys.has('a')) attemptedMoveX -= CHARACTER_STEP_SIZE; // [cite: 481]
          if (activeKeys.has('arrowright') || activeKeys.has('d')) attemptedMoveX += CHARACTER_STEP_SIZE; // [cite: 482]
          
          attemptedMoveX = Math.max(0, Math.min(attemptedMoveX, mapDimensions.width - CHAR_DISPLAY_WIDTH)); // [cite: 483]
          attemptedMoveY = Math.max(0, Math.min(attemptedMoveY, mapDimensions.height - CHAR_DISPLAY_HEIGHT)); // [cite: 484]
        }

        let finalTargetX = currentX;
        let finalTargetY = currentY;

        if (activeCollisionMapConfig) {
          if (attemptedMoveX !== currentX) {
            const tileTypeX = getOverlappingTileType(attemptedMoveX, currentY, CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT, activeCollisionMapConfig);
            if (tileTypeX === 0 || tileTypeX === 2 || tileTypeX === 3 || tileTypeX === 4 || tileTypeX === 99) { // Izinkan berdiri/melewati tile 99 [cite: 487, 488]
              finalTargetX = attemptedMoveX;
            }
          }
          if (attemptedMoveY !== currentY) {
            const tileTypeY = getOverlappingTileType(finalTargetX, attemptedMoveY, CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT, activeCollisionMapConfig);
            if (tileTypeY === 0 || tileTypeY === 2 || tileTypeY === 3 || tileTypeY === 4 || tileTypeY === 99) { // Izinkan berdiri/melewati tile 99 [cite: 489, 490]
              finalTargetY = attemptedMoveY;
            }
          }
        } else {
          finalTargetX = attemptedMoveX; // [cite: 491]
          finalTargetY = attemptedMoveY; // [cite: 492]
        }
        
        if (finalTargetX !== currentX || finalTargetY !== currentY) {
          updateWorldPosition({ x: finalTargetX, y: finalTargetY }); // [cite: 493]
        }
      } // Selesai blok if (!isSleeping) untuk gerakan

      // 3. Gambar Semua Elemen Game
      context.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT); // [cite: 494]
      
      // Gambar Peta
      if (mapImage && mapDimensions.width > 0 && cameraPosition) { // [cite: 495]
        context.drawImage(mapImage, cameraPosition.x, cameraPosition.y, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, 0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
      }

      // Gambar Debug Kolisi
      if (DEBUG_DRAW_COLLISION && activeCollisionMapConfig && activeCollisionMapConfig.data && cameraPosition) { // [cite: 496]
        const collisionDataArray = activeCollisionMapConfig.data; // [cite: 496]
        const tileW = activeCollisionMapConfig.tileWidth; // [cite: 497]
        const tileH = activeCollisionMapConfig.tileHeight; // [cite: 498]
        const startCol = Math.floor(cameraPosition.x / tileW); // [cite: 499]
        const endCol = Math.min(startCol + Math.ceil(VIEWPORT_WIDTH / tileW) + 1, collisionDataArray[0] ? collisionDataArray[0].length : 0); // [cite: 500]
        const startRow = Math.floor(cameraPosition.y / tileH); // [cite: 501]
        const endRow = Math.min(startRow + Math.ceil(VIEWPORT_HEIGHT / tileH) + 1, collisionDataArray.length); // [cite: 502]

        for (let r = Math.max(0, startRow); r < endRow; r++) {
          for (let c = Math.max(0, startCol); c < endCol; c++) {
            if (collisionDataArray[r] && collisionDataArray[r][c] !== 0) { 
              const tileWorldX = c * tileW; // [cite: 503]
              const tileWorldY = r * tileH; // [cite: 504]
              const tileViewportX = tileWorldX - cameraPosition.x; // [cite: 505]
              const tileViewportY = tileWorldY - cameraPosition.y; // [cite: 506]
              if (collisionDataArray[r][c] === 1) { 
                context.fillStyle = 'rgba(255, 0, 0, 0.3)'; // [cite: 507]
              } else if (collisionDataArray[r][c] === 2) { 
                context.fillStyle = 'rgba(0, 0, 255, 0.3)'; // [cite: 508]
              } else if (collisionDataArray[r][c] === 3) {
                context.fillStyle = 'rgba(0, 255, 0, 0.3)'; // [cite: 509]
              } else if (collisionDataArray[r][c] === 4) { 
                context.fillStyle = 'rgba(128, 0, 128, 0.3)'; // [cite: 510]
              } else if (collisionDataArray[r][c] === 99) { // Warna debug untuk tempat tidur
                context.fillStyle = 'rgba(255, 105, 180, 0.4)'; // Contoh: Pink
              }
              context.fillRect(tileViewportX, tileViewportY, tileW, tileH); // [cite: 511]
            }
          }
        }
      }
      
      // Gambar Karakter
      if (cameraPosition && characterImage && isCharacterImageLoaded && spriteConfigToUse) { // [cite: 512]
        const characterViewportX = characterWorldPosition.x - cameraPosition.x; // [cite: 512]
        const characterViewportY = characterWorldPosition.y - cameraPosition.y; // [cite: 513]
        
        let animSourceX = currentFrame * spriteConfigToUse.frameWidth; // [cite: 514]
        let animSourceY;

        if (isSleeping) {
          animSourceY = spriteConfigToUse.rowIndex * spriteConfigToUse.frameHeight;
        } else {
            // Logika untuk animasi berjalan atau diam
            if (facingDirection === 'left') {
                animSourceY = DEFAULT_SPRITE_CONFIG.frameHeight * 0; // Asumsi baris ke-4 untuk jalan kiri di DEFAULT_SPRITE_CONFIG [cite: 516]
            } else {
                animSourceY = DEFAULT_SPRITE_CONFIG.frameHeight * 0; // Asumsi baris ke-0 untuk jalan kanan/diam di DEFAULT_SPRITE_CONFIG [cite: 517]
            }
            // Jika tidak bergerak (diam), tampilkan frame pertama dari animasi arah tersebut
            if (!characterHook.isMoving) { // isMoving dari characterHook
                animSourceX = 0 * spriteConfigToUse.frameWidth; // Frame pertama
            }
        }

        context.drawImage(
          characterImage, 
          animSourceX, animSourceY,
          spriteConfigToUse.frameWidth, spriteConfigToUse.frameHeight,
          characterViewportX, characterViewportY,
          CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT
        ); // [cite: 518]
      }
      
      animationFrameId = requestAnimationFrame(drawGame); // [cite: 542]
    };

    if (assetsReady && activeCollisionMapConfig) {
      drawGame();
    } else {
      context.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT); // [cite: 544]
      context.font = "16px Arial"; context.fillStyle = "black"; // [cite: 545]
      context.textAlign = "center"; // [cite: 546]
      context.fillText("Loading assets...", VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2); // [cite: 547]
    }

    return () => {
      cancelAnimationFrame(animationFrameId); // [cite: 548]
    };
  }, [
    assetsReady, characterWorldPosition, mapDimensions, cameraPosition,
    updateWorldPosition, activeKeysRef, characterImage, isCharacterImageLoaded, mapImage,
    currentFrame, facingDirection, interactionKeyRef, 
    canInteractWithEKey, handleEKeyInteraction, // Ganti handleInteraction menjadi handleEKeyInteraction
    activeCollisionMapConfig,
    isSleeping, // Dari characterHook
    spriteConfigToUse, // Dari characterHook
    characterHook.isMoving, // Untuk animasi diam
    // Dependencies yang ada di original user's file: currentMapKey, interactionTileType (sekarang interactionTileTypeForEKey)
    // currentMapKey dan interactionTileTypeForEKey digunakan dalam handleEKeyInteraction, jadi sudah tercakup.
  ]);

  return (
    <div style={{ position: 'relative', width: `${VIEWPORT_WIDTH}px`, height: `${VIEWPORT_HEIGHT}px` }}> {/* [cite: 550] */}
      <canvas ref={canvasRef} style={{ border: '1px solid black', display: 'block' }} />
      <MinimapCanvas
        mapImage={mapImage} mapDimensions={mapDimensions}
        characterWorldPosition={characterWorldPosition} cameraPosition={cameraPosition}
        mainViewportWidth={VIEWPORT_WIDTH} mainViewportHeight={VIEWPORT_HEIGHT}
        assetsReady={assetsReady}
      />
    </div> // [cite: 550]
  );
}

export default GameCanvas;