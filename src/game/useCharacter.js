// src/game/useCharacter.js
import { useState, useEffect, useRef, useCallback } from 'react';

function useCharacter({
  initialPosition,
  spriteConfig,
}) {
  const [worldPosition, setWorldPosition] = useState(initialPosition); //
  const [isMoving, setIsMoving] = useState(false); //
  const [currentFrame, setCurrentFrame] = useState(0); //
  const [facingDirection, setFacingDirection] = useState('right'); // State baru: 'left' atau 'right'
  const activeKeysRef = useRef(new Set()); //

  const updateWorldPosition = useCallback((newPosition) => { //
    setWorldPosition(newPosition);
  }, []);

  // Efek untuk menangani input keyboard dan arah hadap
  useEffect(() => {
    const handleKeyDown = (event) => {
      const moveKeys = ['ArrowUp', 'w', 'ArrowDown', 's', 'ArrowLeft', 'a', 'ArrowRight', 'd']; //
      if (moveKeys.includes(event.key)) {
        event.preventDefault();
        activeKeysRef.current.add(event.key); //
        if (!isMoving) {
          setIsMoving(true); //
        }
        // Perbarui arah hadap berdasarkan tombol horizontal yang ditekan
        if (event.key === 'ArrowLeft' || event.key === 'a') {
          setFacingDirection('left');
        } else if (event.key === 'ArrowRight' || event.key === 'd') {
          setFacingDirection('right');
        }
      }
    };

    const handleKeyUp = (event) => {
      const moveKeys = ['ArrowUp', 'w', 'ArrowDown', 's', 'ArrowLeft', 'a', 'ArrowRight', 'd']; //
      if (moveKeys.includes(event.key)) {
        event.preventDefault();
        activeKeysRef.current.delete(event.key); //
        if (activeKeysRef.current.size === 0) { //
          setIsMoving(false); //
        } else {
          // Jika masih ada tombol gerakan yang ditekan, perbarui arah hadap jika perlu.
          // Ini menangani kasus ketika satu tombol arah dilepas sementara tombol arah lain masih ditahan.
          const keys = activeKeysRef.current;
          if (!keys.has('ArrowLeft') && !keys.has('a') &&
              (keys.has('ArrowRight') || keys.has('d'))) {
            setFacingDirection('right');
          } else if (!keys.has('ArrowRight') && !keys.has('d') &&
                     (keys.has('ArrowLeft') || keys.has('a'))) {
            setFacingDirection('left');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown); //
    window.addEventListener('keyup', handleKeyUp); //

    return () => {
      window.removeEventListener('keydown', handleKeyDown); //
      window.removeEventListener('keyup', handleKeyUp); //
    };
  }, [isMoving]); // Dependensi isMoving penting di sini

  // Efek untuk loop animasi frame karakter
  useEffect(() => {
    if (!isMoving) {
      setCurrentFrame(0); // Kembali ke frame idle (frame pertama) saat tidak bergerak
      return;
    }

    const animationInterval = setInterval(() => {
      setCurrentFrame(prevFrame => (prevFrame + 1) % spriteConfig.numFrames); //
    }, spriteConfig.animationSpeedMs); //

    return () => clearInterval(animationInterval); //
  }, [isMoving, spriteConfig.numFrames, spriteConfig.animationSpeedMs]); //

  return {
    characterWorldPosition: worldPosition, //
    updateWorldPosition, //
    isMoving, //
    currentFrame, //
    facingDirection, // Ekspor state arah hadap
    activeKeysRef, //
  };
}

export default useCharacter;