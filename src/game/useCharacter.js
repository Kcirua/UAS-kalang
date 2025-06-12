import { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_SPRITE_CONFIG, SLEEP_SPRITE_CONFIG, IDLE_SPRITE_CONFIG, MAKAN_SPRITE_CONFIG } from './gameConstants';

function useCharacter({
  initialPosition,
}) {
  const [worldPosition, setWorldPosition] = useState(initialPosition);
  const [isMoving, setIsMoving] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [facingDirection, setFacingDirection] = useState('down');
  const activeKeysRef = useRef(new Set());
  const interactionKeyRef = useRef(false);
  const [isSleepingForAnimation, setIsSleepingForAnimation] = useState(false);
  const [isEatingForAnimation, setIsEatingForAnimation] = useState(false); // MODIFICATION: Added eating state
  const lastDirectionKey = useRef(null);

  const updateWorldPosition = useCallback((newPosition) => {
    setWorldPosition(newPosition);
  }, []);

  useEffect(() => {
    setWorldPosition(initialPosition);
    setIsSleepingForAnimation(false);
    setIsEatingForAnimation(false); // MODIFICATION: Reset eating state on position change
    setCurrentFrame(0);
  }, [initialPosition]);

  const setSleepingState = useCallback((shouldSleep) => {
    setIsSleepingForAnimation(shouldSleep);
    if (shouldSleep) {
      setIsMoving(false);
      activeKeysRef.current.clear();
      setCurrentFrame(0);
    } else {
      setCurrentFrame(0);
    }
  }, []);

  // MODIFICATION: Added function to control eating state
  const setEatingState = useCallback((shouldEat) => {
    setIsEatingForAnimation(shouldEat);
    if (shouldEat) {
      setIsMoving(false);
      activeKeysRef.current.clear();
      setCurrentFrame(0); // Start eating animation from frame 0
    } else {
      setCurrentFrame(0); // Reset frame when done eating
    }
  }, []);

  // Event listener for keyboard input
  useEffect(() => {
    const handleKeyDown = (event) => {
      // MODIFICATION: Block input if sleeping or eating
      if (isSleepingForAnimation || isEatingForAnimation) return;

      const moveKeys = ['arrowup', 'w', 'arrowdown', 's', 'arrowleft', 'a', 'arrowright', 'd'];
      const interactionKeys = ['e', 'enter'];
      const keyLower = event.key.toLowerCase();

      if (moveKeys.includes(keyLower)) {
        event.preventDefault();
        if (keyLower !== lastDirectionKey.current) {
            activeKeysRef.current.clear();
            lastDirectionKey.current = keyLower;
            activeKeysRef.current.add(keyLower);
        }
        if (!isMoving) setIsMoving(true);
        if (keyLower === 'arrowleft' || keyLower === 'a') {
          setFacingDirection('left');
        } else if (keyLower === 'arrowright' || keyLower === 'd') {
          setFacingDirection('right');
        } else if (keyLower === 'arrowup' || keyLower === 'w') {
          setFacingDirection('up');
        } else if (keyLower === 'arrowdown' || keyLower === 's') {
          setFacingDirection('down');
        }
      }
      if (interactionKeys.includes(keyLower)) {
        event.preventDefault();
        interactionKeyRef.current = true;
      }
    };

    const handleKeyUp = (event) => {
      // MODIFICATION: Block input if sleeping or eating
      if (isSleepingForAnimation || isEatingForAnimation) return;

      const moveKeys = ['arrowup', 'w', 'arrowdown', 's', 'arrowleft', 'a', 'arrowright', 'd'];
      const keyLower = event.key.toLowerCase();

      if (moveKeys.includes(keyLower)) {
        event.preventDefault();
        if(keyLower === lastDirectionKey.current) {
            activeKeysRef.current.delete(keyLower);
            lastDirectionKey.current = null;
            if (activeKeysRef.current.size === 0) {
              setIsMoving(false);
              setCurrentFrame(0);
            }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isMoving, isSleepingForAnimation, isEatingForAnimation]); // MODIFICATION: Added eating state to dependencies

  // Logic to determine the active sprite config
  const spriteConfigToUse = (() => {
    if (isSleepingForAnimation) {
      return SLEEP_SPRITE_CONFIG;
    }
    // MODIFICATION: Return eating sprite if eating
    if (isEatingForAnimation) {
      return MAKAN_SPRITE_CONFIG;
    }
    if (!isMoving) {
      return IDLE_SPRITE_CONFIG;
    }
    return DEFAULT_SPRITE_CONFIG;
  })();

  // Effect to manage the animation loop
  useEffect(() => {
    let animationInterval;
    const currentConfig = spriteConfigToUse;
    if (currentConfig.numFrames > 0) {
         animationInterval = setInterval(() => {
            setCurrentFrame(prevFrame => (prevFrame + 1) % currentConfig.numFrames);
        }, currentConfig.animationSpeedMs);
    } else {
        setCurrentFrame(0);
    }

    return () => clearInterval(animationInterval);
  }, [isMoving, isSleepingForAnimation, isEatingForAnimation, spriteConfigToUse]); // MODIFICATION: Added eating state to dependencies

  return {
    characterWorldPosition: worldPosition,
    updateWorldPosition,
    isMoving,
    currentFrame,
    facingDirection,
    activeKeysRef,
    interactionKeyRef,
    isSleeping: isSleepingForAnimation,
    setSleepingState,
    isEating: isEatingForAnimation, // MODIFICATION: Expose eating state
    setEatingState,               // MODIFICATION: Expose eating state setter
    spriteConfigToUse,
  };
}

export default useCharacter;