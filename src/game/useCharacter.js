// src/game/useCharacter.js
import { useState, useEffect, useRef, useCallback } from 'react'; //
import { DEFAULT_SPRITE_CONFIG, SLEEP_SPRITE_CONFIG, IDLE_SPRITE_CONFIG } from './gameConstants'; // Impor IDLE_SPRITE_CONFIG

function useCharacter({
  initialPosition,
}) {
  const [worldPosition, setWorldPosition] = useState(initialPosition); //
  const [isMoving, setIsMoving] = useState(false); //
  const [currentFrame, setCurrentFrame] = useState(0); //
  const [facingDirection, setFacingDirection] = useState('right'); //
  const activeKeysRef = useRef(new Set()); //
  const interactionKeyRef = useRef(false); //
  const [isSleepingForAnimation, setIsSleepingForAnimation] = useState(false); //

  const updateWorldPosition = useCallback((newPosition) => { //
    setWorldPosition(newPosition);
  }, []); //

  useEffect(() => { //
    setWorldPosition(initialPosition);
    setIsSleepingForAnimation(false);
    setCurrentFrame(0); // Reset frame saat posisi berubah
  }, [initialPosition]); //

  const setSleepingState = useCallback((shouldSleep) => { //
    setIsSleepingForAnimation(shouldSleep);
    if (shouldSleep) {
      setIsMoving(false);
      activeKeysRef.current.clear();
      setCurrentFrame(0); // Mulai animasi tidur dari frame pertama
    } else {
      setCurrentFrame(0); // Reset frame saat bangun (ke frame pertama idle/jalan)
    }
  }, []); //

  // Event listener untuk input keyboard (gerakan dan interaksi)
  useEffect(() => { //
    const handleKeyDown = (event) => {
      if (isSleepingForAnimation) return; // Abaikan input jika sedang tidur

      const moveKeys = ['arrowup', 'w', 'arrowdown', 's', 'arrowleft', 'a', 'arrowright', 'd'];
      const interactionKeys = ['e', 'enter'];
      const keyLower = event.key.toLowerCase();

      if (moveKeys.includes(keyLower)) { //
        event.preventDefault();
        activeKeysRef.current.add(keyLower);
        if (!isMoving) setIsMoving(true); //
        if (keyLower === 'arrowleft' || keyLower === 'a') { //
          setFacingDirection('left');
        } else if (keyLower === 'arrowright' || keyLower === 'd') {
          setFacingDirection('right');
        }
      }
      if (interactionKeys.includes(keyLower)) { //
        event.preventDefault();
        interactionKeyRef.current = true; //
      }
    };

    const handleKeyUp = (event) => {
      // Logika untuk 'E' saat tidur (jika diperlukan untuk bangun) bisa ada di MainPage
      if (isSleepingForAnimation) return; // Abaikan input key up jika sedang tidur juga, kecuali untuk interaksi bangun

      const moveKeys = ['arrowup', 'w', 'arrowdown', 's', 'arrowleft', 'a', 'arrowright', 'd']; //
      const keyLower = event.key.toLowerCase(); //

      if (moveKeys.includes(keyLower)) { //
        event.preventDefault();
        activeKeysRef.current.delete(keyLower); //
        if (activeKeysRef.current.size === 0) {
          setIsMoving(false); //
          setCurrentFrame(0); // Reset ke frame pertama animasi idle saat berhenti
        } else {
          // Update facingDirection jika tombol arah yang berlawanan dilepas
          const keys = activeKeysRef.current; //
          if (!keys.has('arrowleft') && !keys.has('a') && (keys.has('arrowright') || keys.has('d'))) { //
            setFacingDirection('right'); //
          } else if (!keys.has('arrowright') && !keys.has('d') && (keys.has('arrowleft') || keys.has('a'))) { //
            setFacingDirection('left'); //
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
  }, [isMoving, isSleepingForAnimation]); //

  // Logika untuk menentukan sprite config yang aktif
  const spriteConfigToUse = (() => {
    if (isSleepingForAnimation) {
      return SLEEP_SPRITE_CONFIG;
    }
    if (!isMoving) { // Tidak bergerak DAN tidak tidur -> IDLE
      return IDLE_SPRITE_CONFIG;
    }
    // Jika bergerak (dan tidak tidur) -> DEFAULT (jalan)
    return DEFAULT_SPRITE_CONFIG;
  })();

  // Efek untuk mengelola loop animasi (pergantian frame)
  useEffect(() => { //
    let animationInterval;
    const currentConfig = spriteConfigToUse; // Gunakan config yang sudah ditentukan

    // Hanya jalankan interval jika ada frame lebih dari 1 ATAU jika itu adalah animasi tidur/idle yang berulang
    // Untuk idle, kita ingin animasi berlanjut meskipun hanya 1 frame (akan terlihat statis) jika numFrames = 1.
    // Jika numFrames > 1 untuk idle, maka akan beranimasi.
    if (currentConfig.numFrames > 0) { // Pastikan ada frame untuk dianimasikan
        animationInterval = setInterval(() => {
            setCurrentFrame(prevFrame => (prevFrame + 1) % currentConfig.numFrames);
        }, currentConfig.animationSpeedMs);
    } else {
        setCurrentFrame(0); // Jika tidak ada frame (atau numFrames 0), default ke frame 0
    }

    return () => clearInterval(animationInterval);
  }, [isMoving, isSleepingForAnimation, spriteConfigToUse]); // spriteConfigToUse ditambahkan sebagai dependensi

  return {
    characterWorldPosition: worldPosition,
    updateWorldPosition,
    isMoving,
    currentFrame,
    facingDirection,
    activeKeysRef,
    interactionKeyRef,
    isSleeping: isSleepingForAnimation, // Expose status tidur aktual untuk logika game
    setSleepingState,                 // Fungsi untuk mengontrol status tidur dari luar
    spriteConfigToUse,                // Expose sprite config yang sedang aktif
  };
}

export default useCharacter; //