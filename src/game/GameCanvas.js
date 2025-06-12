import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  VIEWPORT_WIDTH, VIEWPORT_HEIGHT, CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT,
  CHARACTER_VIEWPORT_OFFSET_X, CHARACTER_VIEWPORT_OFFSET_Y,
  CHARACTER_STEP_SIZE, DEBUG_DRAW_COLLISION,
} from './gameConstants';
import useGameAssets from './useGameAssets';
import useCamera from './useCamera';
import useCharacter from './useCharacter';
import MinimapCanvas from '../pages/MinimapCanvas';
import { getOverlappingTileType } from './collisionUtils';
import { collisionMapsData, ITEM_TYPES } from './collisionData';

function GameCanvas({
  mapImageSrc,
  characterImageSrc,
  currentMapKey,
  initialCharacterPosition,
  onMapTransitionRequest,
  onInteractionAvailable,
  isCharacterCurrentlySleeping,
  onBedInteraction,
  isCharacterCurrentlyEating,
  onMakanInteraction,
  onItemPickup,
}) {
  const canvasRef = useRef(null);
  const {
    mapImage, characterImage, mapDimensions, isCharacterImageLoaded, assetsReady
  } = useGameAssets(mapImageSrc, characterImageSrc);

  const characterHook = useCharacter({
    initialPosition: initialCharacterPosition,
  });
  const {
    characterWorldPosition, updateWorldPosition, currentFrame,
    activeKeysRef, facingDirection, interactionKeyRef,
    isSleeping,
    setSleepingState,
    setEatingState,
    spriteConfigToUse,
    isMoving,
  } = characterHook;

  const [canInteractWithEKey, setCanInteractWithEKey] = useState(false);
  const [interactionTileTypeForEKey, setInteractionTileTypeForEKey] = useState(0);

  const { cameraPosition } = useCamera({
    characterWorldPosition, mapDimensions, viewportWidth: VIEWPORT_WIDTH, viewportHeight: VIEWPORT_HEIGHT,
    characterViewportOffsetX: CHARACTER_VIEWPORT_OFFSET_X || VIEWPORT_WIDTH / 2,
    characterViewportOffsetY: CHARACTER_VIEWPORT_OFFSET_Y || VIEWPORT_HEIGHT / 2,
    assetsReady,
  });
  const activeCollisionMapConfig = collisionMapsData[currentMapKey];

  useEffect(() => {
    if (setSleepingState) {
      setSleepingState(isCharacterCurrentlySleeping);
    }
  }, [isCharacterCurrentlySleeping, setSleepingState]);

  useEffect(() => {
    if (setEatingState) {
      setEatingState(isCharacterCurrentlyEating);
    }
  }, [isCharacterCurrentlyEating, setEatingState]);

  const handleEKeyInteraction = useCallback(() => {
    if (isSleeping) return;

    if (interactionTileTypeForEKey === 2) { // Pintu Rumah / Gua
      if (currentMapKey === 'world') {
        onMapTransitionRequest('house');
      } else if (currentMapKey === 'house' || currentMapKey === 'caves') {
        onMapTransitionRequest('world');
      }
    } else if (interactionTileTypeForEKey === 3) { // Pintu Rawa
      if (currentMapKey === 'world') {
        onMapTransitionRequest('swamp');
      } else if (currentMapKey === 'swamp') {
        onMapTransitionRequest('world');
      }
    } else if (interactionTileTypeForEKey === 4) { // Pintu Gua dari Dunia
      if (currentMapKey === 'world') {
        onMapTransitionRequest('caves');
      }
    } else if (interactionTileTypeForEKey === 99) { // Tempat Tidur
      if (onBedInteraction) {
        onBedInteraction();
      }
    } else if (interactionTileTypeForEKey === 98) {
      if (onMakanInteraction) {
        onMakanInteraction();
      }
    } else if (interactionTileTypeForEKey === 50) { // Tile Minigame
      console.log("Interacting with Minigame Tile (50). Current position:", characterWorldPosition);
      onMapTransitionRequest('minigame1_trigger', characterWorldPosition);
    } else if (interactionTileTypeForEKey === 51) { // NEW: Tile Minigame 2
      console.log("Interacting with Minigame Tile (51). Current position:", characterWorldPosition);
      onMapTransitionRequest('minigame2_trigger', characterWorldPosition);
    } else if (ITEM_TYPES[interactionTileTypeForEKey]) {
        if (onItemPickup) {
            onItemPickup(interactionTileTypeForEKey);
        }
    }
  }, [currentMapKey, onMapTransitionRequest, interactionTileTypeForEKey, onBedInteraction, onMakanInteraction, isSleeping, characterWorldPosition, onItemPickup]);

  useEffect(() => {
    if (!assetsReady || !mapDimensions.width || !mapDimensions.height || !activeCollisionMapConfig) {
      setCanInteractWithEKey(false);
      setInteractionTileTypeForEKey(0);
      if (onInteractionAvailable) onInteractionAvailable(0);
      return;
    }
    let currentDetectedTileType = 0;
    if (!isSleeping && !isCharacterCurrentlyEating) { // Prevent interaction check while eating
        currentDetectedTileType = getOverlappingTileType(
            characterWorldPosition.x, characterWorldPosition.y,
            CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT, activeCollisionMapConfig
        );
    }
    
    if (onInteractionAvailable) {
      onInteractionAvailable(currentDetectedTileType);
    }

    if (!isSleeping && !isCharacterCurrentlyEating && (currentDetectedTileType === 2 || currentDetectedTileType === 3 || currentDetectedTileType === 4 || currentDetectedTileType === 99 || currentDetectedTileType === 98 || currentDetectedTileType === 50 || currentDetectedTileType === 51 || ITEM_TYPES[currentDetectedTileType])) {
      setCanInteractWithEKey(true);
      setInteractionTileTypeForEKey(currentDetectedTileType);
    } else {
      setCanInteractWithEKey(false);
      setInteractionTileTypeForEKey(0);
    }
  }, [characterWorldPosition, assetsReady, mapDimensions, activeCollisionMapConfig, onInteractionAvailable, isSleeping, isCharacterCurrentlyEating, CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = VIEWPORT_WIDTH;
    canvas.height = VIEWPORT_HEIGHT;
    let animationFrameId;

    const drawGame = () => {
      if (interactionKeyRef.current && canInteractWithEKey && !isSleeping && !isCharacterCurrentlyEating) {
        handleEKeyInteraction();
        interactionKeyRef.current = false;
      }

      // MODIFICATION: Added check for isCharacterCurrentlyEating to prevent movement
      if (!isSleeping && !isCharacterCurrentlyEating) {
        const activeKeys = activeKeysRef.current;
        const currentX = characterWorldPosition.x;
        const currentY = characterWorldPosition.y;
        let attemptedMoveX = currentX;
        let attemptedMoveY = currentY;

        if (activeKeys && activeKeys.size > 0 && mapDimensions.width > 0 && mapDimensions.height > 0 && activeCollisionMapConfig) {
          if (activeKeys.has('arrowup') || activeKeys.has('w')) attemptedMoveY -= CHARACTER_STEP_SIZE;
          if (activeKeys.has('arrowdown') || activeKeys.has('s')) attemptedMoveY += CHARACTER_STEP_SIZE;
          if (activeKeys.has('arrowleft') || activeKeys.has('a')) attemptedMoveX -= CHARACTER_STEP_SIZE;
          if (activeKeys.has('arrowright') || activeKeys.has('d')) attemptedMoveX += CHARACTER_STEP_SIZE;
          
          attemptedMoveX = Math.max(0, Math.min(attemptedMoveX, mapDimensions.width - CHAR_DISPLAY_WIDTH));
          attemptedMoveY = Math.max(0, Math.min(attemptedMoveY, mapDimensions.height - CHAR_DISPLAY_HEIGHT));
        }

        let finalTargetX = currentX;
        let finalTargetY = currentY;

        if (activeCollisionMapConfig) {
          if (attemptedMoveX !== currentX) {
            const tileTypeX = getOverlappingTileType(attemptedMoveX, currentY, CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT, activeCollisionMapConfig);
            if (tileTypeX === 0 || tileTypeX === 2 || tileTypeX === 3 || tileTypeX === 4 || tileTypeX === 99 || tileTypeX === 98 || tileTypeX === 50 || tileTypeX === 51 || ITEM_TYPES[tileTypeX]) {
              finalTargetX = attemptedMoveX;
            }
          }
          if (attemptedMoveY !== currentY) {
            const tileTypeY = getOverlappingTileType(finalTargetX, attemptedMoveY, CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT, activeCollisionMapConfig);
            if (tileTypeY === 0 || tileTypeY === 2 || tileTypeY === 3 || tileTypeY === 4 || tileTypeY === 99 || tileTypeY === 98 || tileTypeY === 50 || tileTypeY === 51 || ITEM_TYPES[tileTypeY]) {
              finalTargetY = attemptedMoveY;
            }
          }
        } else {
          finalTargetX = attemptedMoveX;
          finalTargetY = attemptedMoveY;
        }
        
        if (finalTargetX !== currentX || finalTargetY !== currentY) {
          updateWorldPosition({ x: finalTargetX, y: finalTargetY });
        }
      }

      context.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
      
      if (mapImage && mapDimensions.width > 0 && cameraPosition) {
        context.drawImage(mapImage, cameraPosition.x, cameraPosition.y, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, 0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
      }

      if (DEBUG_DRAW_COLLISION && activeCollisionMapConfig && activeCollisionMapConfig.data && cameraPosition) {
        const collisionDataArray = activeCollisionMapConfig.data;
        const tileW = activeCollisionMapConfig.tileWidth;
        const tileH = activeCollisionMapConfig.tileHeight;
        const startCol = Math.floor(cameraPosition.x / tileW);
        const endCol = Math.min(startCol + Math.ceil(VIEWPORT_WIDTH / tileW) + 1, collisionDataArray[0] ? collisionDataArray[0].length : 0);
        const startRow = Math.floor(cameraPosition.y / tileH);
        const endRow = Math.min(startRow + Math.ceil(VIEWPORT_HEIGHT / tileH) + 1, collisionDataArray.length);

        for (let r = Math.max(0, startRow); r < endRow; r++) {
          for (let c = Math.max(0, startCol); c < endCol; c++) {
            const tileValue = collisionDataArray[r] && collisionDataArray[r][c];
            if (tileValue !== 0) { 
              const tileWorldX = c * tileW;
              const tileWorldY = r * tileH;
              const tileViewportX = tileWorldX - cameraPosition.x;
              const tileViewportY = tileWorldY - cameraPosition.y;
              if (tileValue === 1) { 
                context.fillStyle = 'rgba(255, 0, 0, 0.3)';
              } else if (tileValue === 2) { 
                context.fillStyle = 'rgba(0, 0, 255, 0.3)';
              } else if (tileValue === 3) {
                context.fillStyle = 'rgba(0, 255, 0, 0.3)';
              } else if (tileValue === 4) { 
                context.fillStyle = 'rgba(128, 0, 128, 0.3)';
              } else if (tileValue === 99) {
                context.fillStyle = 'rgba(255, 105, 180, 0.4)';
              } else if (tileValue === 98) {
                context.fillStyle = 'rgba(255, 215, 0, 0.4)';
              } else if (tileValue === 50) {
                context.fillStyle = 'rgba(255, 165, 0, 0.4)';
              } else if (tileValue === 51) {
                context.fillStyle = 'rgba(0, 165, 255, 0.4)';
              } else if (ITEM_TYPES[tileValue]) {
                context.fillStyle = 'rgba(255, 255, 0, 0.4)';
              }
              context.fillRect(tileViewportX, tileViewportY, tileW, tileH);
            }
          }
        }
      }
      
      if (cameraPosition && characterImage && isCharacterImageLoaded && spriteConfigToUse) {
        const characterViewportX = characterWorldPosition.x - cameraPosition.x;
        const characterViewportY = characterWorldPosition.y - cameraPosition.y;
        
        let animSourceX = currentFrame * spriteConfigToUse.frameWidth;
        let animSourceY;

        // This logic correctly uses the rowIndex from the spriteConfig determined in useCharacter.
        // When not moving (which includes sleeping and eating), it uses the specified animation row.
        if (isSleeping || isCharacterCurrentlyEating || !isMoving) {
          animSourceY = spriteConfigToUse.rowIndex * spriteConfigToUse.frameHeight;
        } else { 
          // Walking animation logic
          if (facingDirection === 'down') {
            animSourceY = 4 * spriteConfigToUse.frameHeight;
          } else if (facingDirection === 'left') {
            animSourceY = 5 * spriteConfigToUse.frameHeight;
          } else if (facingDirection === 'right') {
            animSourceY = 6 * spriteConfigToUse.frameHeight;
          } else if (facingDirection === 'up') {
            animSourceY = 7 * spriteConfigToUse.frameHeight;
          } else {
            // Fallback
            animSourceY = spriteConfigToUse.rowIndex * spriteConfigToUse.frameHeight;
          }
        }

        context.drawImage(
          characterImage, 
          animSourceX, animSourceY,
          spriteConfigToUse.frameWidth, spriteConfigToUse.frameHeight,
          characterViewportX, characterViewportY,
          CHAR_DISPLAY_WIDTH, CHAR_DISPLAY_HEIGHT
        );
      }
      
      animationFrameId = requestAnimationFrame(drawGame);
    };

    if (assetsReady && activeCollisionMapConfig) {
      drawGame();
    } else {
      context.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
      context.font = "16px Arial"; context.fillStyle = "black";
      context.textAlign = "center";
      context.fillText("Loading assets...", VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    assetsReady, characterWorldPosition, mapDimensions, cameraPosition,
    updateWorldPosition, activeKeysRef, characterImage, isCharacterImageLoaded, mapImage,
    currentFrame, facingDirection, interactionKeyRef, 
    canInteractWithEKey, handleEKeyInteraction,
    activeCollisionMapConfig,
    isSleeping,
    isCharacterCurrentlyEating,
    spriteConfigToUse,
    isMoving,
  ]);

  return (
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