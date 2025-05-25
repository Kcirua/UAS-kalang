// src/game/useCharacter.js
import { useState, useEffect, useRef, useCallback } from 'react';

function useCharacter({
  initialPosition,
  spriteConfig,
}) {
  const [worldPosition, setWorldPosition] = useState(initialPosition);
  const [isMoving, setIsMoving] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [facingDirection, setFacingDirection] = useState('right');
  const activeKeysRef = useRef(new Set());
  const interactionKeyRef = useRef(false); // Ref untuk status tombol interaksi

  const updateWorldPosition = useCallback((newPosition) => {
    setWorldPosition(newPosition);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const moveKeys = ['ArrowUp', 'w', 'ArrowDown', 's', 'ArrowLeft', 'a', 'ArrowRight', 'd'];
      const interactionKeys = ['e', 'enter']; // Tombol interaksi (gunakan huruf kecil)

      if (moveKeys.includes(event.key.toLowerCase())) {
        event.preventDefault();
        activeKeysRef.current.add(event.key.toLowerCase());
        if (!isMoving) setIsMoving(true);
        if (event.key.toLowerCase() === 'arrowleft' || event.key.toLowerCase() === 'a') {
          setFacingDirection('left');
        } else if (event.key.toLowerCase() === 'arrowright' || event.key.toLowerCase() === 'd') {
          setFacingDirection('right');
        }
      }

      if (interactionKeys.includes(event.key.toLowerCase())) {
        event.preventDefault();
        interactionKeyRef.current = true; // Set ref saat tombol interaksi ditekan
      }
    };

    const handleKeyUp = (event) => {
      const moveKeys = ['ArrowUp', 'w', 'ArrowDown', 's', 'ArrowLeft', 'a', 'ArrowRight', 'd'];
      if (moveKeys.includes(event.key.toLowerCase())) {
        event.preventDefault();
        activeKeysRef.current.delete(event.key.toLowerCase());
        if (activeKeysRef.current.size === 0) {
          setIsMoving(false);
        } else {
          const keys = activeKeysRef.current;
          if (!keys.has('arrowleft') && !keys.has('a') && (keys.has('arrowright') || keys.has('d'))) {
            setFacingDirection('right');
          } else if (!keys.has('arrowright') && !keys.has('d') && (keys.has('arrowleft') || keys.has('a'))) {
            setFacingDirection('left');
          }
        }
      }
      // interactionKeyRef di-reset di GameCanvas setelah digunakan, bukan di keyUp,
      // agar penekanan tombol yang singkat tetap tertangkap.
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isMoving]); // isMoving adalah dependensi yang valid

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
  }, [isMoving, spriteConfig.numFrames, spriteConfig.animationSpeedMs]);

  return {
    characterWorldPosition: worldPosition,
    updateWorldPosition,
    isMoving,
    currentFrame,
    facingDirection,
    activeKeysRef,
    interactionKeyRef, // Ekspor ref ini
  };
}

export default useCharacter;