// src/game/GameCanvas.js
import React, { useRef, useEffect } from 'react';
import {
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
  CHAR_DISPLAY_WIDTH,
  CHAR_DISPLAY_HEIGHT,
  CHARACTER_VIEWPORT_OFFSET_X, // Pastikan ini sesuai dengan yang Anda gunakan
  CHARACTER_VIEWPORT_OFFSET_Y, // Pastikan ini sesuai dengan yang Anda gunakan
  DEFAULT_SPRITE_CONFIG,
  CHARACTER_STEP_SIZE,
  DEBUG_DRAW_COLLISION,
} from './gameConstants';
import useGameAssets from './useGameAssets';
import useCamera from './useCamera';
import useCharacter from './useCharacter'; // Hook karakter yang sudah dimodifikasi
import MinimapCanvas from '../pages/MinimapCanvas';
import { isOverlappingSolidTile } from './collisionUtils';
import { rawCollisionData, COLLISION_TILE_WIDTH, COLLISION_TILE_HEIGHT } from './collisionData';

function GameCanvas({ mapImageSrc, characterImageSrc }) {
  const canvasRef = useRef(null);
  const {
    mapImage,
    characterImage,
    mapDimensions,
    isCharacterImageLoaded,
    assetsReady
  } = useGameAssets(mapImageSrc, characterImageSrc);

  // Ambil facingDirection dari useCharacter
  const {
    characterWorldPosition,
    updateWorldPosition,
    currentFrame,
    activeKeysRef,
    facingDirection, // <-- Tambahkan ini untuk mendapatkan arah hadap karakter
    // isMoving, // Anda bisa tambahkan ini jika memerlukan state isMoving di sini
  } = useCharacter({
    initialPosition: { x: 1335, y: 1760 },
    spriteConfig: DEFAULT_SPRITE_CONFIG,
  });

  const { cameraPosition } = useCamera({
    characterWorldPosition,
    mapDimensions,
    viewportWidth: VIEWPORT_WIDTH,
    viewportHeight: VIEWPORT_HEIGHT,
    // Pastikan Anda menggunakan konstanta yang benar untuk offset kamera jika berbeda
    characterViewportOffsetX: CHARACTER_VIEWPORT_OFFSET_X || VIEWPORT_WIDTH / 2,
    characterViewportOffsetY: CHARACTER_VIEWPORT_OFFSET_Y || VIEWPORT_HEIGHT / 2,
    assetsReady,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = VIEWPORT_WIDTH;
    canvas.height = VIEWPORT_HEIGHT;

    let animationFrameId;

    const drawGame = () => {
      const activeKeys = activeKeysRef.current;
      if (activeKeys && activeKeys.size > 0 && mapDimensions.width > 0 && mapDimensions.height > 0) {
        const currentX = characterWorldPosition.x;
        const currentY = characterWorldPosition.y;
        let targetX = currentX;
        let targetY = currentY;
        let attemptedMoveX = currentX;
        let attemptedMoveY = currentY;

        if (activeKeys.has('ArrowUp') || activeKeys.has('w')) attemptedMoveY -= CHARACTER_STEP_SIZE;
        if (activeKeys.has('ArrowDown') || activeKeys.has('s')) attemptedMoveY += CHARACTER_STEP_SIZE;
        if (activeKeys.has('ArrowLeft') || activeKeys.has('a')) attemptedMoveX -= CHARACTER_STEP_SIZE;
        if (activeKeys.has('ArrowRight') || activeKeys.has('d')) attemptedMoveX += CHARACTER_STEP_SIZE;
        
        attemptedMoveX = Math.max(0, Math.min(attemptedMoveX, mapDimensions.width - CHAR_DISPLAY_WIDTH));
        attemptedMoveY = Math.max(0, Math.min(attemptedMoveY, mapDimensions.height - CHAR_DISPLAY_HEIGHT));

        if (attemptedMoveX !== currentX) {
          if (!isOverlappingSolidTile(attemptedMoveX, currentY, CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT)) {
            targetX = attemptedMoveX;
          }
        }

        if (attemptedMoveY !== currentY) {
          if (!isOverlappingSolidTile(targetX, attemptedMoveY, CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT)) {
            targetY = attemptedMoveY;
          }
        }
        
        if (targetX !== currentX || targetY !== currentY) {
          updateWorldPosition({ x: targetX, y: targetY });
        }
      }

      context.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
      
      if (mapImage && mapDimensions.width > 0 && cameraPosition) {
        context.drawImage(
          mapImage,
          cameraPosition.x, cameraPosition.y,
          VIEWPORT_WIDTH, VIEWPORT_HEIGHT,
          0, 0,
          VIEWPORT_WIDTH, VIEWPORT_HEIGHT
        );
      }

      if (DEBUG_DRAW_COLLISION && rawCollisionData && cameraPosition && COLLISION_TILE_WIDTH > 0 && COLLISION_TILE_HEIGHT > 0) {
        context.fillStyle = 'rgba(255, 0, 0, 0.3)';
        const startCol = Math.floor(cameraPosition.x / COLLISION_TILE_WIDTH);
        const endCol = Math.min(
          startCol + Math.ceil(VIEWPORT_WIDTH / COLLISION_TILE_WIDTH) + 1,
          rawCollisionData[0] ? rawCollisionData[0].length : 0
        );
        const startRow = Math.floor(cameraPosition.y / COLLISION_TILE_HEIGHT);
        const endRow = Math.min(
          startRow + Math.ceil(VIEWPORT_HEIGHT / COLLISION_TILE_HEIGHT) + 1,
          rawCollisionData.length
        );
        for (let r = Math.max(0, startRow); r < endRow; r++) {
          for (let c = Math.max(0, startCol); c < endCol; c++) {
            if (rawCollisionData[r] && rawCollisionData[r][c] === 1) {
              const tileWorldX = c * COLLISION_TILE_WIDTH;
              const tileWorldY = r * COLLISION_TILE_HEIGHT;
              const tileViewportX = tileWorldX - cameraPosition.x;
              const tileViewportY = tileWorldY - cameraPosition.y;
              context.fillRect(
                tileViewportX,
                tileViewportY,
                COLLISION_TILE_WIDTH,
                COLLISION_TILE_HEIGHT
              );
            }
          }
        }
      }

      // Gambar karakter
      if (cameraPosition) {
          const characterViewportX = characterWorldPosition.x - cameraPosition.x;
          const characterViewportY = characterWorldPosition.y - cameraPosition.y;

          if (characterImage && isCharacterImageLoaded && characterImage.naturalWidth > 0) {
            const sourceX = currentFrame * DEFAULT_SPRITE_CONFIG.frameWidth;
            let sourceY = 0; // Default ke baris pertama (misalnya, jalan ke kanan)

            // Tentukan sourceY berdasarkan facingDirection
            // Asumsi: baris 0 untuk 'kanan', baris 1 untuk 'kiri'
            // Sesuaikan jika sprite sheet Anda memiliki urutan yang berbeda
            if (facingDirection === 'left') {
              sourceY = 4 * DEFAULT_SPRITE_CONFIG.frameHeight; // Baris kedua untuk jalan ke kiri
            } else { // 'right' (atau default jika ada kondisi lain)
              sourceY = 0 * DEFAULT_SPRITE_CONFIG.frameHeight; // Baris pertama untuk jalan ke kanan
            }
            
            // Contoh jika ada animasi idle yang berbeda:
            // if (!isMoving && facingDirection === 'left') {
            //   sourceY = INDEKS_BARIS_IDLE_KIRI * DEFAULT_SPRITE_CONFIG.frameHeight;
            // } else if (!isMoving && facingDirection === 'right') {
            //   sourceY = INDEKS_BARIS_IDLE_KANAN * DEFAULT_SPRITE_CONFIG.frameHeight;
            // }


            context.drawImage(
              characterImage,
              sourceX,
              sourceY, // <-- Gunakan sourceY yang telah ditentukan
              DEFAULT_SPRITE_CONFIG.frameWidth,
              DEFAULT_SPRITE_CONFIG.frameHeight,
              characterViewportX,
              characterViewportY,
              CHAR_DISPLAY_WIDTH,
              CHAR_DISPLAY_HEIGHT
            );
          }
      }
      animationFrameId = requestAnimationFrame(drawGame);
    };

    if (assetsReady) {
      drawGame();
    } else {
      context.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
      context.font = "16px Arial";
      context.fillStyle = "black";
      context.textAlign = "center";
      context.fillText("Loading assets...", VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    mapImage, characterImage, mapDimensions, cameraPosition,
    characterWorldPosition, currentFrame, isCharacterImageLoaded, assetsReady,
    activeKeysRef, updateWorldPosition,
    facingDirection // <-- Tambahkan facingDirection ke array dependensi
    // isMoving, // Tambahkan isMoving jika Anda menggunakannya dalam useEffect ini
  ]);

  return (
    <div style={{ position: 'relative', width: `${VIEWPORT_WIDTH}px`, height: `${VIEWPORT_HEIGHT}px` }}>
      <canvas
        ref={canvasRef}
        style={{ border: '1px solid black', display: 'block' }}
      />
      <MinimapCanvas
        mapImage={mapImage}
        mapDimensions={mapDimensions}
        characterWorldPosition={characterWorldPosition}
        cameraPosition={cameraPosition}
        mainViewportWidth={VIEWPORT_WIDTH}
        mainViewportHeight={VIEWPORT_HEIGHT}
        assetsReady={assetsReady}
      />
    </div>
  );
}

export default GameCanvas;