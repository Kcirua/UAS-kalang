// src/game/useCharacter.js
import { useState, useEffect, useRef, useCallback } from 'react'; // [cite: 120]

function useCharacter({
  initialPosition, // Ini akan menjadi dinamis
  spriteConfig,
}) {
  const [worldPosition, setWorldPosition] = useState(initialPosition);
  const [isMoving, setIsMoving] = useState(false); // [cite: 121]
  const [currentFrame, setCurrentFrame] = useState(0); // [cite: 121]
  const [facingDirection, setFacingDirection] = useState('right');
  const activeKeysRef = useRef(new Set());
  const interactionKeyRef = useRef(false); // [cite: 122]

  const updateWorldPosition = useCallback((newPosition) => {
    setWorldPosition(newPosition);
  }, []); // [cite: 123]

  // EFEK BARU: Reset posisi dunia karakter jika initialPosition prop berubah
  useEffect(() => {
    setWorldPosition(initialPosition);
  }, [initialPosition]);

  // useEffect untuk handleKeyDown dan handleKeyUp (tidak berubah signifikan)
  useEffect(() => {
    const handleKeyDown = (event) => {
      const moveKeys = ['arrowup', 'w', 'arrowdown', 's', 'arrowleft', 'a', 'arrowright', 'd']; // sudah lowercase
      const interactionKeys = ['e', 'enter'];

      const keyLower = event.key.toLowerCase();

      if (moveKeys.includes(keyLower)) { // [cite: 124]
        event.preventDefault();
        activeKeysRef.current.add(keyLower);
        if (!isMoving) setIsMoving(true);
        if (keyLower === 'arrowleft' || keyLower === 'a') {
          setFacingDirection('left'); // [cite: 124]
        } else if (keyLower === 'arrowright' || keyLower === 'd') {
          setFacingDirection('right');
        }
      }

      if (interactionKeys.includes(keyLower)) {
        event.preventDefault();
        interactionKeyRef.current = true;
      }
    };

    const handleKeyUp = (event) => {
      const moveKeys = ['arrowup', 'w', 'arrowdown', 's', 'arrowleft', 'a', 'arrowright', 'd']; // [cite: 125]
      const keyLower = event.key.toLowerCase();

      if (moveKeys.includes(keyLower)) { // [cite: 126]
        event.preventDefault();
        activeKeysRef.current.delete(keyLower); // [cite: 127]
        if (activeKeysRef.current.size === 0) {
          setIsMoving(false); // [cite: 128]
        } else {
          const keys = activeKeysRef.current;
          if (!keys.has('arrowleft') && !keys.has('a') && (keys.has('arrowright') || keys.has('d'))) { // [cite: 129]
            setFacingDirection('right'); // [cite: 130]
          } else if (!keys.has('arrowright') && !keys.has('d') && (keys.has('arrowleft') || keys.has('a'))) { // [cite: 130]
            setFacingDirection('left'); // [cite: 131]
          }
        }
      }
      // interactionKeyRef di-reset di GameCanvas [cite: 132]
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    }; // [cite: 133]
  }, [isMoving]); // [cite: 133]

  // Efek untuk animasi frame karakter (tidak berubah)
  useEffect(() => {
    if (!isMoving) {
      setCurrentFrame(0);
      return;
    }
    const animationInterval = setInterval(() => {
      setCurrentFrame(prevFrame => (prevFrame + 1) % spriteConfig.numFrames);
    }, spriteConfig.animationSpeedMs);
    return () => clearInterval(animationInterval);
  }, [isMoving, spriteConfig.numFrames, spriteConfig.animationSpeedMs]); // [cite: 134]

  return {
    characterWorldPosition: worldPosition,
    updateWorldPosition,
    isMoving,
    currentFrame,
    facingDirection,
    activeKeysRef,
    interactionKeyRef, // [cite: 135]
  };
}

export default useCharacter;