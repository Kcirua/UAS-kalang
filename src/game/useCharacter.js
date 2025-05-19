// src/game/useCharacter.js
import { useState, useEffect, useRef, useCallback } from 'react';

function useCharacter({
  initialPosition,
  spriteConfig,
  // mapDimensions, charDisplayWidth, charDisplayHeight, stepSize tidak lagi dibutuhkan di sini
  // karena logika pembaruan posisi & boundary check pindah ke GameCanvas
}) {
  const [worldPosition, setWorldPosition] = useState(initialPosition);
  const [isMoving, setIsMoving] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const activeKeysRef = useRef(new Set());

  // Fungsi untuk memperbarui posisi dunia karakter, dibungkus useCallback
  const updateWorldPosition = useCallback((newPosition) => {
    setWorldPosition(newPosition);
  }, []);

  // Efek untuk menangani input keyboard (hanya mengelola activeKeysRef dan isMoving)
  useEffect(() => {
    const handleKeyDown = (event) => {
      const moveKeys = ['ArrowUp', 'w', 'ArrowDown', 's', 'ArrowLeft', 'a', 'ArrowRight', 'd'];
      if (moveKeys.includes(event.key)) {
        event.preventDefault();
        activeKeysRef.current.add(event.key);
        if (!isMoving) {
          setIsMoving(true);
        }
      }
    };

    const handleKeyUp = (event) => {
      const moveKeys = ['ArrowUp', 'w', 'ArrowDown', 's', 'ArrowLeft', 'a', 'ArrowRight', 'd'];
      if (moveKeys.includes(event.key)) {
        event.preventDefault();
        activeKeysRef.current.delete(event.key);
        if (activeKeysRef.current.size === 0 && isMoving) {
          setIsMoving(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isMoving]); // Dependensi isMoving untuk memastikan closure setIsMoving benar

  // Efek untuk loop animasi frame karakter (berdasarkan isMoving)
  useEffect(() => {
    if (!isMoving) {
      setCurrentFrame(0); // Kembali ke frame idle
      return;
    }

    const animationInterval = setInterval(() => {
      setCurrentFrame(prevFrame => (prevFrame + 1) % spriteConfig.numFrames);
    }, spriteConfig.animationSpeedMs);

    return () => clearInterval(animationInterval);
  }, [isMoving, spriteConfig.numFrames, spriteConfig.animationSpeedMs]);

  return {
    characterWorldPosition: worldPosition,
    updateWorldPosition, // Mengekspos fungsi untuk update posisi
    isMoving,            // Masih berguna untuk logika lain (misal suara)
    currentFrame,
    activeKeysRef,       // Mengekspos ref ke tombol aktif
  };
}

export default useCharacter;