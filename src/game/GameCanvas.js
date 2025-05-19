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
  CHARACTER_STEP_SIZE,
  // Impor konstanta minimap jika perlu di sini, atau biarkan di MinimapCanvas.js
} from './gameConstants';
import useGameAssets from './useGameAssets';
import useCamera from './useCamera';
import useCharacter from './useCharacter';
import MinimapCanvas from '../pages/MinimapCanvas'; // <--- Impor MinimapCanvas

function GameCanvas({ mapImageSrc, characterImageSrc }) {
  const canvasRef = useRef(null);

  const {
    mapImage,
    characterImage,
    mapDimensions,
    isCharacterImageLoaded,
    assetsReady // Pastikan assetsReady diekspor dari useGameAssets
  } = useGameAssets(mapImageSrc, characterImageSrc);

  const {
    characterWorldPosition,
    updateWorldPosition,
    currentFrame,
    activeKeysRef
  } = useCharacter({
    initialPosition: { x: 1335, y: 1760 },
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
      const activeKeys = activeKeysRef.current;
      if (activeKeys && activeKeys.size > 0 && mapDimensions.width > 0 && mapDimensions.height > 0) {
        let { x, y } = characterWorldPosition;

        if (activeKeys.has('ArrowUp') || activeKeys.has('w')) y -= CHARACTER_STEP_SIZE;
        if (activeKeys.has('ArrowDown') || activeKeys.has('s')) y += CHARACTER_STEP_SIZE;
        if (activeKeys.has('ArrowLeft') || activeKeys.has('a')) x -= CHARACTER_STEP_SIZE;
        if (activeKeys.has('ArrowRight') || activeKeys.has('d')) x += CHARACTER_STEP_SIZE;

        x = Math.max(0, Math.min(x, mapDimensions.width - CHAR_DISPLAY_WIDTH));
        y = Math.max(0, Math.min(y, mapDimensions.height - CHAR_DISPLAY_HEIGHT));

        if (x !== characterWorldPosition.x || y !== characterWorldPosition.y) {
          updateWorldPosition({ x, y });
        }
      }

      context.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

      if (mapImage && mapDimensions.width > 0 && cameraPosition) { // Tambahkan cek cameraPosition
        context.drawImage(
          mapImage,
          cameraPosition.x, cameraPosition.y,
          VIEWPORT_WIDTH, VIEWPORT_HEIGHT,
          0, 0,
          VIEWPORT_WIDTH, VIEWPORT_HEIGHT
        );
      }

      // Pastikan cameraPosition ada sebelum menghitung posisi karakter di viewport
      if (cameraPosition) {
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
    activeKeysRef, updateWorldPosition
  ]);

  return (
    // Tambahkan div wrapper untuk positioning relatif jika MinimapCanvas adalah child langsung
    <div style={{ position: 'relative', width: `${VIEWPORT_WIDTH}px`, height: `${VIEWPORT_HEIGHT}px` }}>
      <canvas
        ref={canvasRef}
        style={{ border: '1px solid black', display: 'block' }} // display: 'block' untuk menghilangkan spasi bawah canvas
        // width dan height diatur via JavaScript
      />
      {/* Render MinimapCanvas di sini */}
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