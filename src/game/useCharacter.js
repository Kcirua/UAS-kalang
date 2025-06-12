import { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_SPRITE_CONFIG, SLEEP_SPRITE_CONFIG, IDLE_SPRITE_CONFIG, MAKAN_SPRITE_CONFIG, BATH_SPRITE_CONFIG } from './gameConstants';

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
  const [isEatingForAnimation, setIsEatingForAnimation] = useState(false);
  const [isBathingForAnimation, setIsBathingForAnimation] = useState(false);
  const lastDirectionKey = useRef(null);

  const updateWorldPosition = useCallback((newPosition) => {
    setWorldPosition(newPosition);
  }, []);

  useEffect(() => {
    setWorldPosition(initialPosition);
    setIsSleepingForAnimation(false);
    setIsEatingForAnimation(false);
    setIsBathingForAnimation(false);
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

  const setEatingState = useCallback((shouldEat) => {
    setIsEatingForAnimation(shouldEat);
    if (shouldEat) {
      setIsMoving(false);
      activeKeysRef.current.clear();
      setCurrentFrame(0);
    } else {
      setCurrentFrame(0);
    }
  }, []);

  const setBathingState = useCallback((shouldBathe) => {
    setIsBathingForAnimation(shouldBathe);
    if (shouldBathe) {
      setIsMoving(false);
      activeKeysRef.current.clear();
      setCurrentFrame(0);
    } else {
      setCurrentFrame(0);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isSleepingForAnimation || isEatingForAnimation || isBathingForAnimation) return;

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
      if (isSleepingForAnimation || isEatingForAnimation || isBathingForAnimation) return;
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
  }, [isMoving, isSleepingForAnimation, isEatingForAnimation, isBathingForAnimation]);

  const spriteConfigToUse = (() => {
    if (isSleepingForAnimation) {
      return SLEEP_SPRITE_CONFIG;
    }
    if (isEatingForAnimation) {
      return MAKAN_SPRITE_CONFIG;
    }
    if (isBathingForAnimation) {
      return BATH_SPRITE_CONFIG;
    }
    if (!isMoving) {
      return IDLE_SPRITE_CONFIG;
    }
    return DEFAULT_SPRITE_CONFIG;
  })();

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
  }, [isMoving, isSleepingForAnimation, isEatingForAnimation, isBathingForAnimation, spriteConfigToUse]);

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
    isEating: isEatingForAnimation,
    setEatingState,
    isBathing: isBathingForAnimation,
    setBathingState,
    spriteConfigToUse,
  };
}

export default useCharacter;