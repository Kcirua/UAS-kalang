// src/game/GameCanvas.js
import React, { useRef, useEffect, useCallback, useState } from 'react'; //
import {
  VIEWPORT_WIDTH, VIEWPORT_HEIGHT, CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT,
  CHARACTER_VIEWPORT_OFFSET_X, CHARACTER_VIEWPORT_OFFSET_Y,
  CHARACTER_STEP_SIZE, DEBUG_DRAW_COLLISION,
  // DEFAULT_SPRITE_CONFIG, // Tidak perlu diimpor langsung jika sudah dari useCharacter
} from './gameConstants'; //
import useGameAssets from './useGameAssets'; //
import useCamera from './useCamera'; //
import useCharacter from './useCharacter'; //
import MinimapCanvas from '../pages/MinimapCanvas'; //
import { getOverlappingTileType } from './collisionUtils'; //
import { collisionMapsData } from './collisionData'; //

function GameCanvas({
  mapImageSrc,
  characterImageSrc,
  currentMapKey,
  initialCharacterPosition,
  onMapTransitionRequest,
  onInteractionAvailable,
  isCharacterCurrentlySleeping,
  onBedInteraction,
}) {
  const canvasRef = useRef(null); //
  const {
    mapImage, characterImage, mapDimensions, isCharacterImageLoaded, assetsReady
  } = useGameAssets(mapImageSrc, characterImageSrc); //

  const characterHook = useCharacter({ //
    initialPosition: initialCharacterPosition,
    // spriteConfig tidak lagi dioper dari sini, useCharacter menentukannya secara internal
  }); //
  const {
    characterWorldPosition, updateWorldPosition, currentFrame,
    activeKeysRef, facingDirection, interactionKeyRef,
    isSleeping,         // Status animasi tidur dari useCharacter
    setSleepingState,   // Fungsi untuk memberitahu useCharacter agar memulai/menghentikan animasi tidur
    spriteConfigToUse,  // Config sprite yang sedang aktif (normal, tidur, atau idle) dari useCharacter
    isMoving,           // Kita butuh isMoving dari characterHook untuk logika rendering
  } = characterHook; //

  const [canInteractWithEKey, setCanInteractWithEKey] = useState(false); //
  const [interactionTileTypeForEKey, setInteractionTileTypeForEKey] = useState(0); //

  const { cameraPosition } = useCamera({ //
    characterWorldPosition, mapDimensions, viewportWidth: VIEWPORT_WIDTH, viewportHeight: VIEWPORT_HEIGHT,
    characterViewportOffsetX: CHARACTER_VIEWPORT_OFFSET_X || VIEWPORT_WIDTH / 2,
    characterViewportOffsetY: CHARACTER_VIEWPORT_OFFSET_Y || VIEWPORT_HEIGHT / 2,
    assetsReady,
  }); //
  const activeCollisionMapConfig = collisionMapsData[currentMapKey]; //

  // Sinkronkan status tidur dari MainPage ke hook useCharacter
  useEffect(() => { //
    if (setSleepingState) {
      setSleepingState(isCharacterCurrentlySleeping);
    }
  }, [isCharacterCurrentlySleeping, setSleepingState]); //

  // Handler untuk interaksi tombol 'E'
  const handleEKeyInteraction = useCallback(() => { //
    if (isSleeping) return; // Jangan lakukan interaksi jika sedang tidur

    if (interactionTileTypeForEKey === 2) { // Pintu Rumah / Gua
      if (currentMapKey === 'world') {
        onMapTransitionRequest('house');
      } else if (currentMapKey === 'house' || currentMapKey === 'caves') {
        onMapTransitionRequest('world');
      }
    } else if (interactionTileTypeForEKey === 3) { // Pintu Rawa
      if (currentMapKey === 'world') {
        onMapTransitionRequest('swamp');
      } else if (currentMapKey === 'swamp') { // Keluar dari rawa pakai tile 3
        onMapTransitionRequest('world');
      }
    } else if (interactionTileTypeForEKey === 4) { // Pintu Gua dari Dunia
      if (currentMapKey === 'world') {
        onMapTransitionRequest('caves');
      }
    } else if (interactionTileTypeForEKey === 99) { // Tempat Tidur
      if (onBedInteraction) {
        onBedInteraction(); // Panggil handler dari MainPage
      }
    }
  }, [currentMapKey, onMapTransitionRequest, interactionTileTypeForEKey, onBedInteraction, isSleeping]); //

  // Deteksi tile interaktif untuk onInteractionAvailable dan tombol 'E'
  useEffect(() => { //
    if (!assetsReady || !mapDimensions.width || !mapDimensions.height || !activeCollisionMapConfig) {
      setCanInteractWithEKey(false); //
      setInteractionTileTypeForEKey(0); //
      if (onInteractionAvailable) onInteractionAvailable(0);
      return;
    }
    let currentDetectedTileType = 0;
    if (!isSleeping) { // Hanya deteksi interaksi jika tidak sedang tidur
        currentDetectedTileType = getOverlappingTileType( //
            characterWorldPosition.x, characterWorldPosition.y, //
            CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT, activeCollisionMapConfig
        );
    }
    
    if (onInteractionAvailable) {
      onInteractionAvailable(currentDetectedTileType); // Kirim tipe tile ke MainPage
    }

    // Update state lokal untuk tombol 'E'
    if (!isSleeping && (currentDetectedTileType === 2 || currentDetectedTileType === 3 || currentDetectedTileType === 4 || currentDetectedTileType === 99)) { //
      setCanInteractWithEKey(true); //
      setInteractionTileTypeForEKey(currentDetectedTileType); //
    } else {
      setCanInteractWithEKey(false); //
      setInteractionTileTypeForEKey(0); //
    }
  }, [characterWorldPosition, assetsReady, mapDimensions, activeCollisionMapConfig, onInteractionAvailable, isSleeping, CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT]); //

  // Loop utama game untuk menggambar dan memproses input
  useEffect(() => { //
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = VIEWPORT_WIDTH;
    canvas.height = VIEWPORT_HEIGHT;
    let animationFrameId;

    const drawGame = () => {
      // 1. Proses Interaksi Tombol 'E'
      if (interactionKeyRef.current && canInteractWithEKey && !isSleeping) { //
        handleEKeyInteraction();
        interactionKeyRef.current = false; //
      }

      // 2. Proses Input Gerakan & Update Posisi (Hanya jika tidak tidur)
      if (!isSleeping) { //
        const activeKeys = activeKeysRef.current; //
        const currentX = characterWorldPosition.x; //
        const currentY = characterWorldPosition.y; //
        let attemptedMoveX = currentX; //
        let attemptedMoveY = currentY; //

        if (activeKeys && activeKeys.size > 0 && mapDimensions.width > 0 && mapDimensions.height > 0 && activeCollisionMapConfig) { //
          if (activeKeys.has('arrowup') || activeKeys.has('w')) attemptedMoveY -= CHARACTER_STEP_SIZE; //
          if (activeKeys.has('arrowdown') || activeKeys.has('s')) attemptedMoveY += CHARACTER_STEP_SIZE; //
          if (activeKeys.has('arrowleft') || activeKeys.has('a')) attemptedMoveX -= CHARACTER_STEP_SIZE; //
          if (activeKeys.has('arrowright') || activeKeys.has('d')) attemptedMoveX += CHARACTER_STEP_SIZE; //
          
          attemptedMoveX = Math.max(0, Math.min(attemptedMoveX, mapDimensions.width - CHAR_DISPLAY_WIDTH)); //
          attemptedMoveY = Math.max(0, Math.min(attemptedMoveY, mapDimensions.height - CHAR_DISPLAY_HEIGHT)); //
        }

        let finalTargetX = currentX; //
        let finalTargetY = currentY; //

        if (activeCollisionMapConfig) {
          if (attemptedMoveX !== currentX) {
            const tileTypeX = getOverlappingTileType(attemptedMoveX, currentY, CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT, activeCollisionMapConfig); //
            if (tileTypeX === 0 || tileTypeX === 2 || tileTypeX === 3 || tileTypeX === 4 || tileTypeX === 99) { // Izinkan berdiri/melewati tile 99
              finalTargetX = attemptedMoveX; //
            }
          }
          if (attemptedMoveY !== currentY) {
            const tileTypeY = getOverlappingTileType(finalTargetX, attemptedMoveY, CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT, activeCollisionMapConfig); //
            if (tileTypeY === 0 || tileTypeY === 2 || tileTypeY === 3 || tileTypeY === 4 || tileTypeY === 99) { // Izinkan berdiri/melewati tile 99
              finalTargetY = attemptedMoveY; //
            }
          }
        } else {
          finalTargetX = attemptedMoveX; //
          finalTargetY = attemptedMoveY; //
        }
        
        if (finalTargetX !== currentX || finalTargetY !== currentY) {
          updateWorldPosition({ x: finalTargetX, y: finalTargetY }); //
        }
      } // Selesai blok if (!isSleeping) untuk gerakan

      // 3. Gambar Semua Elemen Game
      context.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT); //
      
      // Gambar Peta
      if (mapImage && mapDimensions.width > 0 && cameraPosition) { //
        context.drawImage(mapImage, cameraPosition.x, cameraPosition.y, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, 0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT); //
      }

      // Gambar Debug Kolisi
      if (DEBUG_DRAW_COLLISION && activeCollisionMapConfig && activeCollisionMapConfig.data && cameraPosition) { //
        const collisionDataArray = activeCollisionMapConfig.data; //
        const tileW = activeCollisionMapConfig.tileWidth; //
        const tileH = activeCollisionMapConfig.tileHeight; //
        const startCol = Math.floor(cameraPosition.x / tileW); //
        const endCol = Math.min(startCol + Math.ceil(VIEWPORT_WIDTH / tileW) + 1, collisionDataArray[0] ? collisionDataArray[0].length : 0); //
        const startRow = Math.floor(cameraPosition.y / tileH); //
        const endRow = Math.min(startRow + Math.ceil(VIEWPORT_HEIGHT / tileH) + 1, collisionDataArray.length); //

        for (let r = Math.max(0, startRow); r < endRow; r++) {
          for (let c = Math.max(0, startCol); c < endCol; c++) {
            if (collisionDataArray[r] && collisionDataArray[r][c] !== 0) { 
              const tileWorldX = c * tileW; //
              const tileWorldY = r * tileH; //
              const tileViewportX = tileWorldX - cameraPosition.x; //
              const tileViewportY = tileWorldY - cameraPosition.y; //
              if (collisionDataArray[r][c] === 1) { 
                context.fillStyle = 'rgba(255, 0, 0, 0.3)'; //
              } else if (collisionDataArray[r][c] === 2) { 
                context.fillStyle = 'rgba(0, 0, 255, 0.3)'; //
              } else if (collisionDataArray[r][c] === 3) {
                context.fillStyle = 'rgba(0, 255, 0, 0.3)'; //
              } else if (collisionDataArray[r][c] === 4) { 
                context.fillStyle = 'rgba(128, 0, 128, 0.3)'; //
              } else if (collisionDataArray[r][c] === 99) { // Warna debug untuk tempat tidur
                context.fillStyle = 'rgba(255, 105, 180, 0.4)'; // Contoh: Pink
              }
              context.fillRect(tileViewportX, tileViewportY, tileW, tileH); //
            }
          }
        }
      }
      
      // Gambar Karakter
      if (cameraPosition && characterImage && isCharacterImageLoaded && spriteConfigToUse) { //
        const characterViewportX = characterWorldPosition.x - cameraPosition.x; //
        const characterViewportY = characterWorldPosition.y - cameraPosition.y; //
        
        let animSourceX = currentFrame * spriteConfigToUse.frameWidth; //
        let animSourceY; //

        // `spriteConfigToUse` sudah berisi `rowIndex` yang benar untuk idle dan sleep
        // Untuk animasi jalan (DEFAULT_SPRITE_CONFIG), kita tentukan rowIndex berdasarkan facingDirection
        if (isSleeping || !isMoving) { // Jika tidur ATAU idle
          animSourceY = spriteConfigToUse.rowIndex * spriteConfigToUse.frameHeight;
          // Jika !isMoving (idle), currentFrame diatur oleh useCharacter untuk animasi idle.
          // Jika isSleeping, currentFrame diatur oleh useCharacter untuk animasi tidur.
        } else { // Bergerak (isMoving === true dan !isSleeping)
            // Tentukan rowIndex untuk animasi jalan berdasarkan facingDirection
            // Asumsi: baris 0 untuk kanan/default, baris 1 untuk kiri pada spritesheet karakter jalan
            // **PENTING: Sesuaikan angka 0 dan 1 ini dengan layout spritesheet Anda!**
            if (facingDirection === 'left') {
                animSourceY = 0 * spriteConfigToUse.frameHeight; // Baris untuk jalan kiri
            } else { // 'right' atau default
                animSourceY = 0 * spriteConfigToUse.frameHeight; // Baris untuk jalan kanan
            }
            // currentFrame akan diupdate oleh useCharacter untuk animasi jalan
        }

        context.drawImage(
          characterImage, 
          animSourceX, animSourceY,
          spriteConfigToUse.frameWidth, spriteConfigToUse.frameHeight,
          characterViewportX, characterViewportY,
          CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT
        ); //
      }
      
      animationFrameId = requestAnimationFrame(drawGame); //
    };

    if (assetsReady && activeCollisionMapConfig) {
      drawGame(); //
    } else {
      // Tampilkan pesan loading jika aset belum siap
      context.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT); //
      context.font = "16px Arial"; context.fillStyle = "black"; //
      context.textAlign = "center"; //
      context.fillText("Loading assets...", VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2); //
    }

    return () => {
      cancelAnimationFrame(animationFrameId); //
    };
  }, [ //
    assetsReady, characterWorldPosition, mapDimensions, cameraPosition,
    updateWorldPosition, activeKeysRef, characterImage, isCharacterImageLoaded, mapImage,
    currentFrame, facingDirection, interactionKeyRef, 
    canInteractWithEKey, handleEKeyInteraction,
    activeCollisionMapConfig,
    isSleeping,         // Dari characterHook
    spriteConfigToUse,  // Dari characterHook
    isMoving,           // Dari characterHook, ditambahkan sebagai dependensi
  ]); //

  return (
    <div style={{ position: 'relative', width: `${VIEWPORT_WIDTH}px`, height: `${VIEWPORT_HEIGHT}px` }}> {/* */}
      <canvas ref={canvasRef} style={{ border: '1px solid black', display: 'block' }} />
      <MinimapCanvas
        mapImage={mapImage} mapDimensions={mapDimensions}
        characterWorldPosition={characterWorldPosition} cameraPosition={cameraPosition}
        mainViewportWidth={VIEWPORT_WIDTH} mainViewportHeight={VIEWPORT_HEIGHT}
        assetsReady={assetsReady}
      />
    </div> //
  );
}

export default GameCanvas;