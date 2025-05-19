// src/game/GameCanvas.js
import React, { useRef, useEffect } from 'react';
import {
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
  CHAR_DISPLAY_WIDTH,
  CHAR_DISPLAY_HEIGHT,
  CHARACTER_VIEWPORT_OFFSET_X,
  CHARACTER_VIEWPORT_OFFSET_Y,
  DEFAULT_SPRITE_CONFIG,
  CHARACTER_STEP_SIZE // Impor kecepatan gerak
} from './gameConstants';
import useGameAssets from './useGameAssets';
import useCamera from './useCamera';
import useCharacter from './useCharacter';

function GameCanvas({ mapImageSrc, characterImageSrc }) {
  const canvasRef = useRef(null);

  const {
    mapImage,
    characterImage,
    mapDimensions,
    isCharacterImageLoaded,
    assetsReady
  } = useGameAssets(mapImageSrc, characterImageSrc);

  const {
    characterWorldPosition, // Posisi saat ini
    updateWorldPosition,    // Fungsi untuk update posisi dari useCharacter
    currentFrame,
    activeKeysRef           // Ref ke tombol yang aktif dari useCharacter
  } = useCharacter({
    initialPosition: { x: 1335, y: 1760 }, // Posisi awal dari kode sebelumnya [cite: 51]
    spriteConfig: DEFAULT_SPRITE_CONFIG,
  });

  const { cameraPosition } = useCamera({
    characterWorldPosition,
    mapDimensions,
    viewportWidth: VIEWPORT_WIDTH,
    viewportHeight: VIEWPORT_HEIGHT,
    characterViewportOffsetX: CHARACTER_VIEWPORT_OFFSET_X,
    characterViewportOffsetY: CHARACTER_VIEWPORT_OFFSET_Y,
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
      // --- Logika Pembaruan Posisi Karakter ---
      const activeKeys = activeKeysRef.current; // Dapatkan tombol yang sedang aktif
      if (activeKeys && activeKeys.size > 0 && mapDimensions.width > 0 && mapDimensions.height > 0) {
        let { x, y } = characterWorldPosition; // Ambil posisi saat ini

        if (activeKeys.has('ArrowUp') || activeKeys.has('w')) y -= CHARACTER_STEP_SIZE;
        if (activeKeys.has('ArrowDown') || activeKeys.has('s')) y += CHARACTER_STEP_SIZE;
        if (activeKeys.has('ArrowLeft') || activeKeys.has('a')) x -= CHARACTER_STEP_SIZE;
        if (activeKeys.has('ArrowRight') || activeKeys.has('d')) x += CHARACTER_STEP_SIZE;

        // Batasan pergerakan karakter agar tidak keluar peta [cite: 72, 73]
        x = Math.max(0, Math.min(x, mapDimensions.width - CHAR_DISPLAY_WIDTH));
        y = Math.max(0, Math.min(y, mapDimensions.height - CHAR_DISPLAY_HEIGHT));

        // Hanya panggil updateWorldPosition jika posisi benar-benar berubah
        if (x !== characterWorldPosition.x || y !== characterWorldPosition.y) {
          updateWorldPosition({ x, y }); // Perbarui state posisi di useCharacter
        }
      }
      // --- Akhir Logika Pembaruan Posisi Karakter ---

      context.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

      if (mapImage && mapDimensions.width > 0) {
        context.drawImage(
          mapImage,
          cameraPosition.x, cameraPosition.y,
          VIEWPORT_WIDTH, VIEWPORT_HEIGHT,
          0, 0,
          VIEWPORT_WIDTH, VIEWPORT_HEIGHT
        );
      }

      const characterViewportX = characterWorldPosition.x - cameraPosition.x;
      const characterViewportY = characterWorldPosition.y - cameraPosition.y;

      if (characterImage && isCharacterImageLoaded && characterImage.naturalWidth > 0) {
        const sourceX = currentFrame * DEFAULT_SPRITE_CONFIG.frameWidth;
        const sourceY = 0;

        context.drawImage(
          characterImage,
          sourceX,
          sourceY,
          DEFAULT_SPRITE_CONFIG.frameWidth,
          DEFAULT_SPRITE_CONFIG.frameHeight,
          characterViewportX,
          characterViewportY,
          CHAR_DISPLAY_WIDTH,
          CHAR_DISPLAY_HEIGHT
        );
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
    activeKeysRef, updateWorldPosition // Tambahkan sebagai dependensi
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{ border: '1px solid black', width: `${VIEWPORT_WIDTH}px`, height: `${VIEWPORT_HEIGHT}px` }}
    />
  );
}

export default GameCanvas;