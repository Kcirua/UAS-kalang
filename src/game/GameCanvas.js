// src/game/GameCanvas.js
import React, { useState, useRef, useEffect, useCallback } from 'react'; // Tambahkan useState & useCallback
// import { useNavigate } from 'react-router-dom'; // Jika Anda menggunakan routing
import {
  VIEWPORT_WIDTH, VIEWPORT_HEIGHT, CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT,
  CHARACTER_VIEWPORT_OFFSET_X, CHARACTER_VIEWPORT_OFFSET_Y,
  DEFAULT_SPRITE_CONFIG, CHARACTER_STEP_SIZE, DEBUG_DRAW_COLLISION,
} from './gameConstants';
import useGameAssets from './useGameAssets';
import useCamera from './useCamera';
import useCharacter from './useCharacter';
import MinimapCanvas from '../pages/MinimapCanvas';
import { getOverlappingTileType } from './collisionUtils'; // Anda sudah punya ini
import { rawCollisionData, COLLISION_TILE_WIDTH, COLLISION_TILE_HEIGHT } from './collisionData';

function GameCanvas({ mapImageSrc, characterImageSrc }) {
  const canvasRef = useRef(null);
  // const navigate = useNavigate(); // Aktifkan jika menggunakan React Router

  const {
    mapImage, characterImage, mapDimensions, isCharacterImageLoaded, assetsReady
  } = useGameAssets(mapImageSrc, characterImageSrc);

  const {
    characterWorldPosition, updateWorldPosition, currentFrame,
    activeKeysRef, facingDirection, interactionKeyRef // Ambil interactionKeyRef
  } = useCharacter({
    initialPosition: { x: 1335, y: 1760 },
    spriteConfig: DEFAULT_SPRITE_CONFIG,
  });

  const [canInteractWithDoor, setCanInteractWithDoor] = useState(false); // State baru

  const { cameraPosition } = useCamera({
    characterWorldPosition, mapDimensions, viewportWidth: VIEWPORT_WIDTH, viewportHeight: VIEWPORT_HEIGHT,
    characterViewportOffsetX: CHARACTER_VIEWPORT_OFFSET_X || VIEWPORT_WIDTH / 2,
    characterViewportOffsetY: CHARACTER_VIEWPORT_OFFSET_Y || VIEWPORT_HEIGHT / 2,
    assetsReady,
  });

  // Memoize handleEnterHouse jika dijadikan dependensi useEffect lain
  const handleEnterHouse = useCallback(() => {
    console.log("INTERAKSI DENGAN PINTU! MASUK RUMAH...");
    // Contoh: navigate('/rumah');
    // Tambahkan logika lain yang diperlukan (reset state, dll.)
  }, [/* navigate */]); // Tambahkan navigate jika digunakan

  // Efek untuk memperbarui canInteractWithDoor berdasarkan posisi karakter
  useEffect(() => {
    if (!assetsReady || !mapDimensions.width || !mapDimensions.height) {
      setCanInteractWithDoor(false); // Tidak bisa berinteraksi jika aset belum siap
      return;
    }
    const currentTileType = getOverlappingTileType(
      characterWorldPosition.x, characterWorldPosition.y,
      CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT
    );
    setCanInteractWithDoor(currentTileType === 2);
  }, [characterWorldPosition, assetsReady, mapDimensions]); // mapDimensions diperlukan jika getOverlappingTileType bergantung padanya secara tidak langsung

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = VIEWPORT_WIDTH;
    canvas.height = VIEWPORT_HEIGHT;
    let animationFrameId;

    const drawGame = () => {
      // 1. Proses Interaksi (jika tombol ditekan DAN bisa berinteraksi)
      if (interactionKeyRef.current && canInteractWithDoor) {
        handleEnterHouse();
        interactionKeyRef.current = false; // Reset flag setelah interaksi diproses
      }

      // 2. Proses Input Gerakan dan Update Posisi
      const activeKeys = activeKeysRef.current;
      const currentX = characterWorldPosition.x;
      const currentY = characterWorldPosition.y;
      let attemptedMoveX = currentX;
      let attemptedMoveY = currentY;

      if (activeKeys && activeKeys.size > 0 && mapDimensions.width > 0 && mapDimensions.height > 0) {
        if (activeKeys.has('arrowup') || activeKeys.has('w')) attemptedMoveY -= CHARACTER_STEP_SIZE;
        if (activeKeys.has('arrowdown') || activeKeys.has('s')) attemptedMoveY += CHARACTER_STEP_SIZE;
        if (activeKeys.has('arrowleft') || activeKeys.has('a')) attemptedMoveX -= CHARACTER_STEP_SIZE;
        if (activeKeys.has('arrowright') || activeKeys.has('d')) attemptedMoveX += CHARACTER_STEP_SIZE;
        
        attemptedMoveX = Math.max(0, Math.min(attemptedMoveX, mapDimensions.width - CHAR_DISPLAY_WIDTH));
        attemptedMoveY = Math.max(0, Math.min(attemptedMoveY, mapDimensions.height - CHAR_DISPLAY_HEIGHT));
      }

      let finalTargetX = currentX;
      let finalTargetY = currentY;

      // Cek pergerakan horizontal
      if (attemptedMoveX !== currentX) {
        const tileTypeX = getOverlappingTileType(attemptedMoveX, currentY, CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT);
        // Izinkan gerakan jika tile adalah bisa dilewati (0) atau pintu (2)
        // Interaksi dengan pintu ditangani secara terpisah
        if (tileTypeX === 0 || tileTypeX === 2) {
          finalTargetX = attemptedMoveX;
        }
        // Jika tileTypeX === 1 (solid), gerakan diblokir (finalTargetX tetap currentX)
      }

      // Cek pergerakan vertikal (gunakan finalTargetX dari hasil horizontal)
      if (attemptedMoveY !== currentY) {
        const tileTypeY = getOverlappingTileType(finalTargetX, attemptedMoveY, CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT);
        if (tileTypeY === 0 || tileTypeY === 2) {
          finalTargetY = attemptedMoveY;
        }
        // Jika tileTypeY === 1 (solid), gerakan diblokir
      }
      
      if (finalTargetX !== currentX || finalTargetY !== currentY) {
        updateWorldPosition({ x: finalTargetX, y: finalTargetY });
      }

      // 3. Gambar Semua Elemen Game
      context.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
      
      // Gambar Peta
      if (mapImage && mapDimensions.width > 0 && cameraPosition) {
        context.drawImage(mapImage, cameraPosition.x, cameraPosition.y, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, 0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
      }

      // Gambar Debug Kolisi (tidak berubah dari sebelumnya, sudah menampilkan tile pintu)
      if (DEBUG_DRAW_COLLISION && rawCollisionData && cameraPosition /* ... */) {
        // ... logika debug kolisi Anda ...
        const startCol = Math.floor(cameraPosition.x / COLLISION_TILE_WIDTH);
        const endCol = Math.min(startCol + Math.ceil(VIEWPORT_WIDTH / COLLISION_TILE_WIDTH) + 1, rawCollisionData[0] ? rawCollisionData[0].length : 0);
        const startRow = Math.floor(cameraPosition.y / COLLISION_TILE_HEIGHT);
        const endRow = Math.min(startRow + Math.ceil(VIEWPORT_HEIGHT / COLLISION_TILE_HEIGHT) + 1, rawCollisionData.length);

        for (let r = Math.max(0, startRow); r < endRow; r++) {
          for (let c = Math.max(0, startCol); c < endCol; c++) {
            if (rawCollisionData[r] && rawCollisionData[r][c] !== 0) { 
              const tileWorldX = c * COLLISION_TILE_WIDTH;
              const tileWorldY = r * COLLISION_TILE_HEIGHT;
              const tileViewportX = tileWorldX - cameraPosition.x;
              const tileViewportY = tileWorldY - cameraPosition.y;

              if (rawCollisionData[r][c] === 1) { 
                context.fillStyle = 'rgba(255, 0, 0, 0.3)'; 
              } else if (rawCollisionData[r][c] === 2) { 
                context.fillStyle = 'rgba(0, 0, 255, 0.3)'; // Biru untuk pintu
              }
              context.fillRect(tileViewportX, tileViewportY, COLLISION_TILE_WIDTH, COLLISION_TILE_HEIGHT);
            }
          }
        }
      }

      // Gambar Karakter (tidak berubah)
      if (cameraPosition && characterImage && isCharacterImageLoaded /* ... */) {
        const characterViewportX = characterWorldPosition.x - cameraPosition.x;
        const characterViewportY = characterWorldPosition.y - cameraPosition.y;
        
        // Menentukan frame mana yang akan diambil dari sprite sheet secara horizontal
        const sourceX = currentFrame * DEFAULT_SPRITE_CONFIG.frameWidth;
        
        let sourceY = 0; // Default ke baris pertama (misalnya, untuk animasi berjalan ke kanan)

        // Mengganti baris pada sprite sheet berdasarkan arah hadap karakter
        if (facingDirection === 'left') {
          // Jika menghadap kiri, gunakan baris ke-2 (indeks 1) dari sprite sheet
          sourceY = 4 * DEFAULT_SPRITE_CONFIG.frameHeight; 
        } else { 
          // Jika menghadap kanan (atau default), gunakan baris ke-1 (indeks 0)
          sourceY = 0 * DEFAULT_SPRITE_CONFIG.frameHeight;
        }

        // Menggambar frame yang sesuai dari sprite sheet ke canvas
        context.drawImage(
          characterImage, 
          sourceX, // Posisi X frame pada sprite sheet
          sourceY, // Posisi Y (baris) frame pada sprite sheet
          DEFAULT_SPRITE_CONFIG.frameWidth,  // Lebar satu frame
          DEFAULT_SPRITE_CONFIG.frameHeight, // Tinggi satu frame
          characterViewportX, // Posisi X karakter di canvas
          characterViewportY, // Posisi Y karakter di canvas
          CHAR_DISPLAY_WIDTH,   // Lebar karakter saat digambar di canvas
          CHAR_DISPLAY_HEIGHT   // Tinggi karakter saat digambar di canvas
        );
      }
      // Tampilkan prompt interaksi jika bisa berinteraksi dengan pintu
      if (canInteractWithDoor) {
        context.fillStyle = "white";
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.font = "bold 16px Arial";
        context.textAlign = "center";
        const promptText = "Tekan 'E' untuk Masuk";
        const textX = characterWorldPosition.x - cameraPosition.x + (CHAR_DISPLAY_WIDTH / 2);
        const textY = characterWorldPosition.y - cameraPosition.y - 10; // Sedikit di atas karakter
        
        // Latar belakang untuk teks agar mudah dibaca (opsional)
        // const textWidth = context.measureText(promptText).width;
        // context.fillStyle = "rgba(0,0,0,0.5)";
        // context.fillRect(textX - textWidth / 2 - 5, textY - 18, textWidth + 10, 24);
        
        context.strokeText(promptText, textX, textY);
        context.fillStyle = "white"; // Kembalikan fillStyle
        context.fillText(promptText, textX, textY);
      }

      animationFrameId = requestAnimationFrame(drawGame);
    };

    if (assetsReady) {
      drawGame();
    } else {
      context.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
      context.font = "16px Arial"; context.fillStyle = "black"; context.textAlign = "center";
      context.fillText("Loading assets...", VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    assetsReady, characterWorldPosition, mapDimensions, cameraPosition,
    updateWorldPosition, activeKeysRef, characterImage, isCharacterImageLoaded, mapImage,
    currentFrame, facingDirection, interactionKeyRef, canInteractWithDoor, handleEnterHouse
    // Pastikan semua dependensi yang reaktif (state, props, fungsi yang dimemoize) ada di sini
  ]);

  return ( /* ... JSX canvas Anda ... */
    <div style={{ position: 'relative', width: `${VIEWPORT_WIDTH}px`, height: `${VIEWPORT_HEIGHT}px` }}>
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